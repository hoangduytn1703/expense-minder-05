
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MonthSelector from "@/components/month-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IncomeTable from "@/components/income-table";
import ExpenseTable from "@/components/expense-table";
import AddIncomeDialog from "@/components/add-income-dialog";
import AddExpenseDialog from "@/components/add-expense-dialog";
import { useIncomes } from "@/hooks/use-incomes";
import { useExpenses } from "@/hooks/use-expenses";
import { useCategories } from "@/hooks/use-categories";
import { AssetsProvider } from "@/contexts/AssetsContext";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { incomes, fetchIncomes, isLoading: incomesLoading } = useIncomes(selectedMonth, selectedYear);
  const { expenses, fetchExpenses, isLoading: expensesLoading } = useExpenses(selectedMonth, selectedYear);
  const { incomeCategories, expenseCategories, fetchCategories, isLoading: categoriesLoading } = useCategories();
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchIncomes();
    fetchExpenses();
    fetchCategories();
  }, [selectedMonth, selectedYear, fetchIncomes, fetchExpenses, fetchCategories]);

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return (
    <AssetsProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="max-w-5xl mx-auto">
              <MonthSelector
                month={selectedMonth}
                year={selectedYear}
                onChange={handleMonthChange}
              />

              <Tabs defaultValue="income" className="w-full">
                <TabsList>
                  <TabsTrigger value="income">Thu nhập</TabsTrigger>
                  <TabsTrigger value="expense">Chi tiêu</TabsTrigger>
                </TabsList>

                {/* Income Table */}
                <TabsContent value="income" className="space-y-4 mt-6">
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setIsAddIncomeOpen(true)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Thêm thu nhập mới
                    </Button>
                  </div>
                  
                  <IncomeTable 
                    incomes={incomes}
                    month={selectedMonth}
                    year={selectedYear}
                    onUpdate={fetchIncomes}
                  />
                </TabsContent>

                {/* Expense Table */}
                <TabsContent value="expense" className="space-y-4 mt-6">
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setIsAddExpenseOpen(true)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Thêm chi tiêu mới
                    </Button>
                  </div>
                  
                  <ExpenseTable 
                    expenses={expenses}
                    month={selectedMonth}
                    year={selectedYear}
                    onUpdate={fetchExpenses}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      {/* Add Income Dialog */}
      <AddIncomeDialog
        month={selectedMonth}
        year={selectedYear}
        open={isAddIncomeOpen}
        onOpenChange={setIsAddIncomeOpen}
        onSave={fetchIncomes}
        categories={incomeCategories}
      />

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        month={selectedMonth}
        year={selectedYear}
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        onSave={fetchExpenses}
        categories={expenseCategories}
      />
    </AssetsProvider>
  );
}

// Import Button component
import { Button } from "@/components/ui/button";
