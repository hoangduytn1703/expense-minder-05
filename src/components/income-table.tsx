
import React, { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Lock } from "lucide-react";
import { Income, incomeAPI } from "@/lib/api";
import { formatCurrency, getIncomeCategoryName, incomeCategories } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import EditIncomeDialog from "./edit-income-dialog";
import AddIncomeDialog from "./add-income-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [displayedIncomes, setDisplayedIncomes] = useState<Income[]>([]);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  
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
    
    setEditingIncome(income);
    setIsEditDialogOpen(true);
  };
  
  const confirmDelete = (income: Income) => {
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
    
    setIncomeToDelete(income);
    setDeleteConfirmOpen(true);
  };
  
  const deleteIncome = async () => {
    if (!incomeToDelete) return;
    
    const id = incomeToDelete._id || incomeToDelete.id;
    if (!id) return;
    
    try {
      await incomeAPI.delete(id);
      toast({
        title: "Thành công",
        description: "Đã xóa khoản thu nhập",
      });
      onUpdate();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setIncomeToDelete(null);
    }
  };
  
  const isPreviousMonth = (category: string) => category === 'previousMonth';
  
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
                  {formatCurrency(income.amount)} đ
                </TableCell>
                <TableCell>
                  {income.note || ""}
                </TableCell>
                <TableCell className="text-right">
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
                            onClick={() => confirmDelete(income)}
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      <div className="mt-4 flex justify-between items-center">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsAddDialogOpen(true)}
          type="button"
        >
          <PlusCircle className="h-4 w-4" /> Thêm
        </Button>
        <div className="font-bold">
          TỔNG THU NHẬP: {formatCurrency(totalIncome)} đ
        </div>
      </div>

      {/* Edit dialog */}
      {editingIncome && (
        <EditIncomeDialog
          income={editingIncome}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={onUpdate}
        />
      )}

      {/* Add dialog */}
      <AddIncomeDialog
        month={month}
        year={year}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={onUpdate}
        categories={categories}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa khoản thu nhập này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={deleteIncome} className="bg-red-500 hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
