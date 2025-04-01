import React, { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2, Lock } from "lucide-react";
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
  
  useEffect(() => {
    const mergedIncomes: Income[] = [];
    
    const incomeMap = new Map();
    incomes.forEach(income => {
      incomeMap.set(income.category, income);
    });
    
    categories.forEach(category => {
      if (incomeMap.has(category.id)) {
        mergedIncomes.push(incomeMap.get(category.id));
      } else {
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
  
  const totalIncome = displayedIncomes.reduce((sum, income) => sum + income.amount, 0);
  
  const startEditing = (income: Income) => {
    if (income.category === 'previousMonth') {
      toast({
        title: "Không thể chỉnh sửa",
        description: "Không thể chỉnh sửa khoản tiền còn lại từ tháng trước",
        variant: "destructive",
      });
      return;
    }
    
    const actualId = income._id || income.id;
    setEditingId(actualId || null);
    setEditAmount(formatNumberInput(income.amount.toString()));
    setEditNote(income.note || "");
  };
  
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
  
  const handleSave = (income: Income) => {
    const id = income._id || income.id;
    if (id) {
      saveEdit(id);
    } else {
      createIncome(income);
    }
  };
  
  const deleteIncome = async (income: Income) => {
    if (income.category === 'previousMonth') {
      toast({
        title: "Không thể xóa",
        description: "Không thể xóa khoản tiền còn lại từ tháng trước",
        variant: "destructive",
      });
      return;
    }
    
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
  
  const addIncome = async () => {
    if (newCategory === 'previousMonth') {
      toast({
        title: "Không thể thêm",
        description: "Không thể thêm khoản tiền còn lại từ tháng trước thủ công",
        variant: "destructive",
      });
      return;
    }
    
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
  
  const handleAmountChange = (value: string, setterFunction: React.Dispatch<React.SetStateAction<string>>) => {
    const formattedValue = formatNumberInput(value);
    setterFunction(formattedValue);
  };
  
  const isPreviousMonth = (category: string) => category === 'previousMonth';
  
  const availableCategories = categories.filter(cat => cat.id !== 'previousMonth');
  
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
            const isPreviousMonthItem = isPreviousMonth(income.category);
            
            return (
              <TableRow key={income.category}>
                <TableCell>
                  {getIncomeCategoryName(income.category)}
                  {isPreviousMonthItem && (
                    <Lock className="h-3 w-3 ml-1 inline text-gray-500" />
                  )}
                </TableCell>
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
                      {!isPreviousMonthItem && (
                        <>
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
                        </>
                      )}
                      {isPreviousMonthItem && (
                        <span className="text-sm text-gray-500 italic">Tự động cập nhật</span>
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
                  {availableCategories.map((cat) => (
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
