
import React, { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Expense, expenseAPI } from "@/lib/api";
import { formatCurrency, getExpenseCategoryName, expenseCategories } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import EditExpenseDialog from "./edit-expense-dialog";
import AddExpenseDialog from "./add-expense-dialog";
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
  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  
  useEffect(() => {
    const mergedExpenses: Expense[] = [];
    
    const expenseMap = new Map();
    expenses.forEach(expense => {
      expenseMap.set(expense.category, expense);
    });
    
    categories.forEach(category => {
      if (expenseMap.has(category.id)) {
        mergedExpenses.push(expenseMap.get(category.id));
      } else {
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
  
  const totalExpense = displayedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const startEditing = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditDialogOpen(true);
  };
  
  const confirmDelete = (expense: Expense) => {
    const id = expense._id || expense.id;
    if (!id) {
      toast({
        title: "Thông báo",
        description: "Mục này chưa được lưu vào cơ sở dữ liệu",
      });
      return;
    }
    
    setExpenseToDelete(expense);
    setDeleteConfirmOpen(true);
  };
  
  const deleteExpense = async () => {
    if (!expenseToDelete) return;
    
    const id = expenseToDelete._id || expenseToDelete.id;
    if (!id) return;
    
    try {
      await expenseAPI.delete(id);
      toast({
        title: "Thành công",
        description: "Đã xóa khoản chi tiêu",
      });
      onUpdate();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setExpenseToDelete(null);
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
          {displayedExpenses.map((expense) => {
            const actualId = expense._id || expense.id;
            
            return (
              <TableRow key={expense.category}>
                <TableCell>{getExpenseCategoryName(expense.category)}</TableCell>
                <TableCell>{expense.scope}</TableCell>
                <TableCell>{formatCurrency(expense.amount)} đ</TableCell>
                <TableCell>
                  {expense.actualAmount ? `${formatCurrency(expense.actualAmount)} đ` : ""}
                </TableCell>
                <TableCell>{expense.note || ""}</TableCell>
                <TableCell className="text-right">
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
                        onClick={() => confirmDelete(expense)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
          TỔNG CHI TIÊU: {formatCurrency(totalExpense)} đ
        </div>
      </div>

      {/* Edit dialog */}
      {editingExpense && (
        <EditExpenseDialog
          expense={editingExpense}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={onUpdate}
        />
      )}

      {/* Add dialog */}
      <AddExpenseDialog
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
              Bạn có chắc muốn xóa khoản chi tiêu này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={deleteExpense} className="bg-red-500 hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
