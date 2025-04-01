
import React, { useState } from "react";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Income, incomeAPI } from "@/lib/api";
import { formatCurrency, getIncomeCategoryName, incomeCategories } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface IncomeTableProps {
  incomes: Income[];
  month: number;
  year: number;
  onUpdate: () => void;
}

export default function IncomeTable({ incomes, month, year, onUpdate }: IncomeTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editNote, setEditNote] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState(incomeCategories[0].id);
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newNote, setNewNote] = useState("");
  
  // Tính tổng thu nhập
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  
  // Bắt đầu chỉnh sửa một mục
  const startEditing = (income: Income) => {
    setEditingId(income.id || null);
    setEditAmount(income.amount);
    setEditNote(income.note || "");
  };
  
  // Lưu chỉnh sửa
  const saveEdit = async (id: string) => {
    try {
      await incomeAPI.update(id, { amount: editAmount, note: editNote });
      toast({
        title: "Thành công",
        description: "Đã cập nhật khoản thu nhập",
      });
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    }
  };
  
  // Xóa một mục
  const deleteIncome = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa mục này không?")) {
      try {
        await incomeAPI.delete(id);
        toast({
          title: "Thành công",
          description: "Đã xóa khoản thu nhập",
        });
        onUpdate();
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };
  
  // Thêm mục mới
  const addIncome = async () => {
    try {
      await incomeAPI.create({
        month,
        year,
        category: newCategory,
        amount: newAmount,
        note: newNote,
      });
      
      toast({
        title: "Thành công",
        description: "Đã thêm khoản thu nhập mới",
      });
      
      setIsAdding(false);
      setNewCategory(incomeCategories[0].id);
      setNewAmount(0);
      setNewNote("");
      onUpdate();
    } catch (error) {
      console.error("Lỗi khi thêm:", error);
    }
  };
  
  return (
    <div>
      <Table>
        <TableCaption>THU NHẬP</TableCaption>
        <TableHeader className="bg-yellow-100">
          <TableRow>
            <TableHead>Mục</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incomes.map((income) => (
            <TableRow key={income.id}>
              <TableCell>{getIncomeCategoryName(income.category)}</TableCell>
              <TableCell>
                {editingId === income.id ? (
                  <Input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-32"
                  />
                ) : (
                  `${formatCurrency(income.amount)} đ`
                )}
              </TableCell>
              <TableCell>
                {editingId === income.id ? (
                  <Input
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                  />
                ) : (
                  income.note || ""
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === income.id ? (
                  <Button size="sm" onClick={() => saveEdit(income.id!)}>
                    Lưu
                  </Button>
                ) : (
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEditing(income)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteIncome(income.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          
          {isAdding && (
            <TableRow>
              <TableCell>
                <select
                  className="w-full p-2 border rounded"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {incomeCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  placeholder="Số tiền"
                  className="w-32"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ghi chú"
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button size="sm" onClick={addIncome}>
                    Lưu
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                    Hủy
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <div className="mt-4 flex justify-between items-center">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <PlusCircle className="h-4 w-4" /> Thêm
        </Button>
        <div className="font-bold">
          TỔNG THU NHẬP: {formatCurrency(totalIncome)} đ
        </div>
      </div>
    </div>
  );
}
