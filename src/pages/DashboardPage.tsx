import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MonthSelector from "@/components/month-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomeTable } from "@/components/income-table";
import { ExpenseTable } from "@/components/expense-table";
import { AddIncomeDialog } from "@/components/add-income-dialog";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { useIncomes } from "@/hooks/use-incomes";
import { useExpenses } from "@/hooks/use-expenses";
import { useCategories } from "@/hooks/use-categories";
import { AssetsProvider } from "@/contexts/AssetsContext";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { incomes, fetchIncomes } = useIncomes(selectedMonth, selectedYear);
  const { expenses, fetchExpenses } = useExpenses(selectedMonth, selectedYear);
  const { incomeCategories, expenseCategories, fetchCategories } = useCategories();

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
                    <AddIncomeDialog
                      month={selectedMonth}
                      year={selectedYear}
                      onSuccess={fetchIncomes}
                      categories={incomeCategories}
                    />
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
                    <AddExpenseDialog
                      month={selectedMonth}
                      year={selectedYear}
                      onSuccess={fetchExpenses}
                      categories={expenseCategories}
                    />
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
    </AssetsProvider>
  );
}
