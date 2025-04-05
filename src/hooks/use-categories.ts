
import { useState, useCallback } from 'react';
import { 
  IncomeCategory, 
  ExpenseCategory, 
  incomeCategoryAPI, 
  expenseCategoryAPI 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useCategories() {
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const [incomeData, expenseData] = await Promise.all([
        incomeCategoryAPI.getAll(),
        expenseCategoryAPI.getAll()
      ]);
      setIncomeCategories(incomeData);
      setExpenseCategories(expenseData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh mục",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const addIncomeCategory = useCallback(
    async (category: Omit<IncomeCategory, 'id'>) => {
      try {
        await incomeCategoryAPI.add(category);
        toast({
          title: "Thành công",
          description: "Đã thêm danh mục thu nhập mới",
        });
        await fetchCategories();
        return true;
      } catch (error) {
        console.error('Error adding income category:', error);
        toast({
          title: "Lỗi",
          description: "Không thể thêm danh mục thu nhập",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchCategories, toast]
  );

  const updateIncomeCategory = useCallback(
    async (id: string, category: Partial<IncomeCategory>) => {
      try {
        await incomeCategoryAPI.update(id, category);
        toast({
          title: "Thành công",
          description: "Đã cập nhật danh mục thu nhập",
        });
        await fetchCategories();
        return true;
      } catch (error) {
        console.error('Error updating income category:', error);
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật danh mục thu nhập",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchCategories, toast]
  );

  const deleteIncomeCategory = useCallback(
    async (id: string) => {
      try {
        await incomeCategoryAPI.delete(id);
        toast({
          title: "Thành công",
          description: "Đã xóa danh mục thu nhập",
        });
        await fetchCategories();
        return true;
      } catch (error) {
        console.error('Error deleting income category:', error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa danh mục thu nhập",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchCategories, toast]
  );

  const addExpenseCategory = useCallback(
    async (category: Omit<ExpenseCategory, 'id'>) => {
      try {
        await expenseCategoryAPI.add(category);
        toast({
          title: "Thành công",
          description: "Đã thêm danh mục chi tiêu mới",
        });
        await fetchCategories();
        return true;
      } catch (error) {
        console.error('Error adding expense category:', error);
        toast({
          title: "Lỗi",
          description: "Không thể thêm danh mục chi tiêu",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchCategories, toast]
  );

  const updateExpenseCategory = useCallback(
    async (id: string, category: Partial<ExpenseCategory>) => {
      try {
        await expenseCategoryAPI.update(id, category);
        toast({
          title: "Thành công",
          description: "Đã cập nhật danh mục chi tiêu",
        });
        await fetchCategories();
        return true;
      } catch (error) {
        console.error('Error updating expense category:', error);
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật danh mục chi tiêu",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchCategories, toast]
  );

  const deleteExpenseCategory = useCallback(
    async (id: string) => {
      try {
        await expenseCategoryAPI.delete(id);
        toast({
          title: "Thành công",
          description: "Đã xóa danh mục chi tiêu",
        });
        await fetchCategories();
        return true;
      } catch (error) {
        console.error('Error deleting expense category:', error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa danh mục chi tiêu",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchCategories, toast]
  );

  return {
    incomeCategories,
    expenseCategories,
    isLoading,
    fetchCategories,
    addIncomeCategory,
    updateIncomeCategory,
    deleteIncomeCategory,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
  };
}
