
import React, { useState } from "react";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Expense, expenseAPI } from "@/lib/api";
import { formatCurrency, getExpenseCategoryName, expenseCategories } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ExpenseTableProps {
  expenses: Expense[];
  month: number;
  year: number;
  onUpdate: () => void;
}

export default function ExpenseTable({ expenses, month, year, onUpdate }: ExpenseTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editActualAmount, setEditActualAmount] = useState<number | undefined>(undefined);
  const [editNote, setEditNote] = useState<string>("");
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState(expenseCategories[0].id);
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newActualAmount, setNewActualAmount] = useState<number | undefined>(undefined);
  const [newNote, setNewNote] = useState("");
  
  // Tính tổng chi tiêu
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Bắt đầu chỉnh sửa một mục
  const startEditing = (expense: Expense) => {
    setEditingId(expense.id || null);
    setEditAmount(expense.amount);
    setEditActualAmount(expense.actualAmount);
    setEditNote(expense.note || "");
  };
  
  // Lưu chỉnh sửa
  const saveEdit = async (id: string) => {
    try {
      await expenseAPI.update(id, { 
        amount: editAmount, 
        actualAmount: editActualAmount,
        note: editNote 
      });
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật khoản chi tiêu",
      });
      
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    }
  };
  
  // Xóa một mục
  const deleteExpense = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa mục này không?")) {
      try {
        await expenseAPI.delete(id);
        
        toast({
          title: "Thành công",
          description: "Đã xóa khoản chi tiêu",
        });
        
        onUpdate();
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };
  
  // Thêm mục mới
  const addExpense = async () => {
    try {
      const selectedCategory = expenseCategories.find(cat => cat.id === newCategory);
      
      await expenseAPI.create({
        month,
        year,
        category: newCategory,
        scope: selectedCategory?.scope || "S",
        amount: newAmount,
        actualAmount: newActualAmount,
        note: newNote,
      });
      
      toast({
        title: "Thành công",
        description: "Đã thêm khoản chi tiêu mới",
      });
      
      setIsAdding(false);
      setNewCategory(expenseCategories[0].id);
      setNewAmount(0);
      setNewActualAmount(undefined);
      setNewNote("");
      onUpdate();
    } catch (error) {
      console.error("Lỗi khi thêm:", error);
    }
  };
  
  return (
    <div>
      <Table>
        <TableCaption>CHI TIÊU</TableCaption>
        <TableHeader className="bg-red-100">
          <TableRow>
            <TableHead>Mục</TableHead>
            <TableHead>Phạm vi</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Thực tế</TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => {
            const category = expenseCategories.find(cat => cat.id === expense.category);
            
            return (
              <TableRow key={expense.id}>
                <TableCell>{getExpenseCategoryName(expense.category)}</TableCell>
                <TableCell>{expense.scope}</TableCell>
                <TableCell>
                  {editingId === expense.id ? (
                    <Input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(Number(e.target.value))}
                      className="w-28"
                    />
                  ) : (
                    `${formatCurrency(expense.amount)} đ`
                  )}
                </TableCell>
                <TableCell>
                  {editingId === expense.id ? (
                    <Input
                      type="number"
                      value={editActualAmount || ""}
                      onChange={(e) => 
                        setEditActualAmount(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="w-28"
                      placeholder="Thực tế"
                    />
                  ) : (
                    expense.actualAmount ? `${formatCurrency(expense.actualAmount)} đ` : ""
                  )}
                </TableCell>
                <TableCell>
                  {editingId === expense.id ? (
                    <Input
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                    />
                  ) : (
                    expense.note || ""
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === expense.id ? (
                    <Button size="sm" onClick={() => saveEdit(expense.id!)}>
                      Lưu
                    </Button>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditing(expense)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deleteExpense(expense.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          
          {isAdding && (
            <TableRow>
              <TableCell>
                <select
                  className="w-full p-2 border rounded"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.scope})
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                {expenseCategories.find(cat => cat.id === newCategory)?.scope || ""}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  placeholder="Dự kiến"
                  className="w-28"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={newActualAmount || ""}
                  onChange={(e) => 
                    setNewActualAmount(e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="Thực tế"
                  className="w-28"
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
                  <Button size="sm" onClick={addExpense}>
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
          TỔNG CHI TIÊU: {formatCurrency(totalExpense)} đ
        </div>
      </div>
    </div>
  );
}
