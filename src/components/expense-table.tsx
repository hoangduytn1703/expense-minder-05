
import React, { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Expense, expenseAPI } from "@/lib/api";
import { formatCurrency, getExpenseCategoryName, expenseCategories, formatNumberInput, parseFormattedNumber } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ExpenseTableProps {
  expenses: Expense[];
  month: number;
  year: number;
  categories?: typeof expenseCategories;
  onUpdate: () => void;
}

export default function ExpenseTable({ 
  expenses, 
  month, 
  year, 
  categories = expenseCategories,
  onUpdate 
}: ExpenseTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('0');
  const [editActualAmount, setEditActualAmount] = useState<string>('');
  const [editNote, setEditNote] = useState<string>("");
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState(categories[0].id);
  const [newAmount, setNewAmount] = useState<string>('0');
  const [newActualAmount, setNewActualAmount] = useState<string>('');
  const [newNote, setNewNote] = useState("");
  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
  
  // Chuẩn bị dữ liệu để hiển thị tất cả các loại chi tiêu
  useEffect(() => {
    const mergedExpenses: Expense[] = [];
    
    // Tạo map từ dữ liệu hiện có
    const expenseMap = new Map();
    expenses.forEach(expense => {
      expenseMap.set(expense.category, expense);
    });
    
    // Đảm bảo tất cả các loại chi tiêu đều được hiển thị
    categories.forEach(category => {
      if (expenseMap.has(category.id)) {
        // Nếu đã có dữ liệu cho loại này, sử dụng nó
        mergedExpenses.push(expenseMap.get(category.id));
      } else {
        // Nếu chưa có, tạo mục mới với số tiền là 0
        mergedExpenses.push({
          category: category.id,
          month,
          year,
          amount: 0,
          scope: category.scope,
          note: ""
        });
      }
    });
    
    setDisplayedExpenses(mergedExpenses);
  }, [expenses, categories, month, year]);
  
  // Tính tổng chi tiêu
  const totalExpense = displayedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Bắt đầu chỉnh sửa một mục
  const startEditing = (expense: Expense) => {
    const actualId = expense._id || expense.id;
    setEditingId(actualId || null);
    setEditAmount(formatNumberInput(expense.amount.toString()));
    setEditActualAmount(expense.actualAmount ? formatNumberInput(expense.actualAmount.toString()) : '');
    setEditNote(expense.note || "");
  };
  
  // Lưu chỉnh sửa
  const saveEdit = async (id: string) => {
    try {
      const amount = parseFormattedNumber(editAmount);
      const actualAmount = editActualAmount ? parseFormattedNumber(editActualAmount) : undefined;
      
      await expenseAPI.update(id, { 
        amount, 
        actualAmount,
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
  
  // Thêm mới một mục không có sẵn ID
  const createExpense = async (expense: Expense) => {
    try {
      const amount = parseFormattedNumber(editAmount);
      const actualAmount = editActualAmount ? parseFormattedNumber(editActualAmount) : undefined;
      
      await expenseAPI.create({
        ...expense,
        amount,
        actualAmount,
        note: editNote,
      });
      
      toast({
        title: "Thành công",
        description: "Đã tạo khoản chi tiêu",
      });
      
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error("Lỗi khi tạo:", error);
    }
  };
  
  // Xử lý lưu chỉnh sửa
  const handleSave = (expense: Expense) => {
    const id = expense._id || expense.id;
    if (id) {
      saveEdit(id);
    } else {
      createExpense(expense);
    }
  };
  
  // Xóa một mục
  const deleteExpense = async (expense: Expense) => {
    const id = expense._id || expense.id;
    if (!id) {
      toast({
        title: "Thông báo",
        description: "Mục này chưa được lưu vào cơ sở dữ liệu",
      });
      return;
    }
    
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
      const selectedCategory = categories.find(cat => cat.id === newCategory);
      const amount = parseFormattedNumber(newAmount);
      const actualAmount = newActualAmount ? parseFormattedNumber(newActualAmount) : undefined;
      
      await expenseAPI.create({
        month,
        year,
        category: newCategory,
        scope: selectedCategory?.scope || "S",
        amount,
        actualAmount,
        note: newNote,
      });
      
      toast({
        title: "Thành công",
        description: "Đã thêm khoản chi tiêu mới",
      });
      
      setIsAdding(false);
      setNewCategory(categories[0].id);
      setNewAmount('0');
      setNewActualAmount('');
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
          {displayedExpenses.map((expense) => {
            const category = categories.find(cat => cat.id === expense.category);
            const actualId = expense._id || expense.id;
            const isEditing = editingId === actualId;
            
            return (
              <TableRow key={expense.category}>
                <TableCell>{getExpenseCategoryName(expense.category)}</TableCell>
                <TableCell>{expense.scope}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editAmount}
                      onChange={(e) => handleAmountChange(e.target.value, setEditAmount)}
                      className="w-28"
                    />
                  ) : (
                    `${formatCurrency(expense.amount)} đ`
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editActualAmount}
                      onChange={(e) => handleAmountChange(e.target.value, setEditActualAmount)}
                      className="w-28"
                      placeholder="Thực tế"
                    />
                  ) : (
                    expense.actualAmount ? `${formatCurrency(expense.actualAmount)} đ` : ""
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                    />
                  ) : (
                    expense.note || ""
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <Button size="sm" onClick={() => handleSave(expense)} type="button">
                      Lưu
                    </Button>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditing(expense)}
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {actualId && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteExpense(expense)}
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
                {(() => {
                  const selectedCategory = categories.find(cat => cat.id === newCategory);
                  return selectedCategory?.scope || "";
                })()}
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={newAmount}
                  onChange={(e) => handleAmountChange(e.target.value, setNewAmount)}
                  placeholder="Số tiền"
                  className="w-28"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={newActualAmount}
                  onChange={(e) => handleAmountChange(e.target.value, setNewActualAmount)}
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
                  <Button size="sm" onClick={addExpense} type="button">
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
          TỔNG CHI TIÊU: {formatCurrency(totalExpense)} đ
        </div>
      </div>
    </div>
  );
}
