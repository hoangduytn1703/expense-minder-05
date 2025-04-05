
import { useState, useCallback } from 'react';
import { Expense, expenseAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useExpenses(month: number, year: number) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await expenseAPI.getAll(month, year);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu chi tiêu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [month, year, toast]);

  const addExpense = useCallback(
    async (expense: Omit<Expense, 'id'>) => {
      try {
        await expenseAPI.add(expense);
        toast({
          title: "Thành công",
          description: "Đã thêm chi tiêu mới",
        });
        await fetchExpenses();
        return true;
      } catch (error) {
        console.error('Error adding expense:', error);
        toast({
          title: "Lỗi",
          description: "Không thể thêm chi tiêu",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchExpenses, toast]
  );

  const updateExpense = useCallback(
    async (id: string, expense: Partial<Expense>) => {
      try {
        await expenseAPI.update(id, expense);
        toast({
          title: "Thành công",
          description: "Đã cập nhật chi tiêu",
        });
        await fetchExpenses();
        return true;
      } catch (error) {
        console.error('Error updating expense:', error);
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật chi tiêu",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchExpenses, toast]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      try {
        await expenseAPI.delete(id);
        toast({
          title: "Thành công",
          description: "Đã xóa chi tiêu",
        });
        await fetchExpenses();
        return true;
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa chi tiêu",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchExpenses, toast]
  );

  return {
    expenses,
    isLoading,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
