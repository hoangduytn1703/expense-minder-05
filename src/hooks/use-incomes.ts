
import { useState, useCallback } from 'react';
import { Income, incomeAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useIncomes(month: number, year: number) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchIncomes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await incomeAPI.getAll(month, year);
      setIncomes(data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu thu nhập",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [month, year, toast]);

  const addIncome = useCallback(
    async (income: Omit<Income, 'id'>) => {
      try {
        await incomeAPI.add(income);
        toast({
          title: "Thành công",
          description: "Đã thêm thu nhập mới",
        });
        await fetchIncomes();
        return true;
      } catch (error) {
        console.error('Error adding income:', error);
        toast({
          title: "Lỗi",
          description: "Không thể thêm thu nhập",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchIncomes, toast]
  );

  const updateIncome = useCallback(
    async (id: string, income: Partial<Income>) => {
      try {
        await incomeAPI.update(id, income);
        toast({
          title: "Thành công",
          description: "Đã cập nhật thu nhập",
        });
        await fetchIncomes();
        return true;
      } catch (error) {
        console.error('Error updating income:', error);
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật thu nhập",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchIncomes, toast]
  );

  const deleteIncome = useCallback(
    async (id: string) => {
      try {
        await incomeAPI.delete(id);
        toast({
          title: "Thành công",
          description: "Đã xóa thu nhập",
        });
        await fetchIncomes();
        return true;
      } catch (error) {
        console.error('Error deleting income:', error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa thu nhập",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchIncomes, toast]
  );

  return {
    incomes,
    isLoading,
    fetchIncomes,
    addIncome,
    updateIncome,
    deleteIncome,
  };
}
