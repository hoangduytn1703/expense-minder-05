
import React, { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Income, incomeAPI } from "@/lib/api";
import { formatCurrency, getIncomeCategoryName, incomeCategories, formatNumberInput, parseFormattedNumber } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface IncomeTableProps {
  incomes: Income[];
  month: number;
  year: number;
  categories?: typeof incomeCategories;
  onUpdate: () => void;
}

export default function IncomeTable({ 
  incomes, 
  month, 
  year, 
  categories = incomeCategories,
  onUpdate 
}: IncomeTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('0');
  const [editNote, setEditNote] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState(categories[0].id);
  const [newAmount, setNewAmount] = useState<string>('0');
  const [newNote, setNewNote] = useState("");
  const [displayedIncomes, setDisplayedIncomes] = useState<Income[]>([]);
  
  // Chuẩn bị dữ liệu để hiển thị tất cả các loại thu nhập
  useEffect(() => {
    const mergedIncomes: Income[] = [];
    
    // Tạo map từ dữ liệu hiện có
    const incomeMap = new Map();
    incomes.forEach(income => {
      incomeMap.set(income.category, income);
    });
    
    // Đảm bảo tất cả các loại thu nhập đều được hiển thị
    categories.forEach(category => {
      if (incomeMap.has(category.id)) {
        // Nếu đã có dữ liệu cho loại này, sử dụng nó
        mergedIncomes.push(incomeMap.get(category.id));
      } else {
        // Nếu chưa có, tạo mục mới với số tiền là 0
        mergedIncomes.push({
          category: category.id,
          month,
          year,
          amount: 0,
          note: ""
        });
      }
    });
    
    setDisplayedIncomes(mergedIncomes);
  }, [incomes, categories, month, year]);
  
  // Tính tổng thu nhập
  const totalIncome = displayedIncomes.reduce((sum, income) => sum + income.amount, 0);
  
  // Bắt đầu chỉnh sửa một mục
  const startEditing = (income: Income) => {
    const actualId = income._id || income.id;
    setEditingId(actualId || null);
    setEditAmount(formatNumberInput(income.amount.toString()));
    setEditNote(income.note || "");
  };
  
  // Lưu chỉnh sửa
  const saveEdit = async (id: string) => {
    try {
      const amount = parseFormattedNumber(editAmount);
      await incomeAPI.update(id, { amount, note: editNote });
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
  
  // Thêm mới một mục không có sẵn ID
  const createIncome = async (income: Income) => {
    try {
      const amount = parseFormattedNumber(editAmount);
      await incomeAPI.create({
        ...income,
        amount,
        note: editNote,
      });
      toast({
        title: "Thành công",
        description: "Đã tạo khoản thu nhập",
      });
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error("Lỗi khi tạo:", error);
    }
  };
  
  // Xử lý lưu chỉnh sửa
  const handleSave = (income: Income) => {
    const id = income._id || income.id;
    if (id) {
      saveEdit(id);
    } else {
      createIncome(income);
    }
  };
  
  // Xóa một mục
  const deleteIncome = async (income: Income) => {
    const id = income._id || income.id;
    if (!id) {
      toast({
        title: "Thông báo",
        description: "Mục này chưa được lưu vào cơ sở dữ liệu",
      });
      return;
    }
    
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
      const amount = parseFormattedNumber(newAmount);
      await incomeAPI.create({
        month,
        year,
        category: newCategory,
        amount,
        note: newNote,
      });
      
      toast({
        title: "Thành công",
        description: "Đã thêm khoản thu nhập mới",
      });
      
      setIsAdding(false);
      setNewCategory(categories[0].id);
      setNewAmount('0');
      setNewNote("");
      onUpdate();
    } catch (error) {
      console.error("Lỗi khi thêm:", error);
    }
  };
  
  // Xử lý thay đổi số tiền với định dạng
  const handleAmountChange = (value: string, setterFunction: React.Dispatch<React.SetStateAction<string>>) => {
    const formattedValue = formatNumberInput(value);
    setterFunction(formattedValue);
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
          {displayedIncomes.map((income) => {
            const actualId = income._id || income.id;
            const isEditing = editingId === actualId;
            
            return (
              <TableRow key={income.category}>
                <TableCell>{getIncomeCategoryName(income.category)}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editAmount}
                      onChange={(e) => handleAmountChange(e.target.value, setEditAmount)}
                      className="w-32"
                    />
                  ) : (
                    `${formatCurrency(income.amount)} đ`
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                    />
                  ) : (
                    income.note || ""
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <Button size="sm" onClick={() => handleSave(income)} type="button">
                      Lưu
                    </Button>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditing(income)}
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {actualId && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteIncome(income)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={newAmount}
                  onChange={(e) => handleAmountChange(e.target.value, setNewAmount)}
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
                  <Button size="sm" onClick={addIncome} type="button">
                    Lưu
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAdding(false)} type="button">
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
          type="button"
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
