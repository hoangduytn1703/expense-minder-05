
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryTable from "./category-table";
import { ExpenseCategory, IncomeCategory, expenseCategoryAPI, incomeCategoryAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function CategoryManagement() {
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expenseCats, incomeCats] = await Promise.all([
        expenseCategoryAPI.getAll(),
        incomeCategoryAPI.getAll()
      ]);
      
      setExpenseCategories(expenseCats);
      setIncomeCategories(incomeCats);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý danh mục</h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="expense">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="expense">Chi tiêu</TabsTrigger>
            <TabsTrigger value="income">Thu nhập</TabsTrigger>
          </TabsList>
          
          <TabsContent value="expense">
            <CategoryTable 
              categories={expenseCategories} 
              type="expense" 
              onUpdate={loadData} 
            />
          </TabsContent>
          
          <TabsContent value="income">
            <CategoryTable 
              categories={incomeCategories} 
              type="income" 
              onUpdate={loadData} 
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
