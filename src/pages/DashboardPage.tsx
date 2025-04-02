
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MonthSelector from "@/components/month-selector";
import SummaryCard from "@/components/summary-card";
import BudgetTabs from "@/components/tabs/budget-tabs";
import IncomeTable from "@/components/income-table";
import ExpenseTable from "@/components/expense-table";
import DebtManagement from "@/components/debt-management";
import { Income, Expense, incomeAPI, expenseAPI, summaryAPI } from "@/lib/api";
import { incomeCategories, expenseCategories } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AssetsProvider, useAssets } from "@/contexts/AssetsContext";

function DashboardContent() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [previousMonthRemaining, setPreviousMonthRemaining] = useState(0);
  const [previousMonthInfo, setPreviousMonthInfo] = useState("");
  const [displayedIncomes, setDisplayedIncomes] = useState<Income[]>([]);
  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
  const [isDataUpdating, setIsDataUpdating] = useState(false);
  const { refreshTotalAssets } = useAssets();
  
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);
  
  useEffect(() => {
    loadData();
  }, [month, year]);
  
  const loadData = async () => {
    setIsDataUpdating(true);
    setLoading(true);
    
    try {
      console.log("Fetching summary data for month:", month, "year:", year);
      const summary = await summaryAPI.getMonthSummary(month, year);
      console.log("Summary data:", summary);
      
      setTotalIncome(summary.totalIncome);
      setTotalExpense(summary.totalExpense);
      setRemaining(summary.remaining);
      setPreviousMonthRemaining(summary.previousMonthRemaining);
      
      // Create a readable previous month string
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear--;
      }
      setPreviousMonthInfo(`${prevMonth}/${prevYear}`);
      
      // Fetch incomes and expenses data
      const incomesData = await incomeAPI.getByMonth(month, year);
      console.log("Income data:", incomesData);
      setIncomes(incomesData);
      
      const expensesData = await expenseAPI.getByMonth(month, year);
      setExpenses(expensesData);
      
      // Refresh total assets after data changes
      await refreshTotalAssets();
      
      prepareDisplayData(incomesData, expensesData);
      setTimeout(() => {
        setLoading(false);
        setIsDataUpdating(false);
      }, 1000);
      
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLoading(false);
        setIsDataUpdating(false);
      }, 1000);
    }
  };
  
  const prepareDisplayData = (incomesData: Income[], expensesData: Expense[]) => {
    const incomeMap = new Map();
    incomesData.forEach(income => {
      incomeMap.set(income.category, income);
    });
    
    const fullIncomes: Income[] = [];
    incomeCategories.forEach(category => {
      if (incomeMap.has(category.id)) {
        fullIncomes.push(incomeMap.get(category.id));
      } else {
        fullIncomes.push({
          category: category.id,
          month,
          year,
          amount: 0,
          note: ""
        });
      }
    });
    setDisplayedIncomes(fullIncomes);
    
    const expenseMap = new Map();
    expensesData.forEach(expense => {
      expenseMap.set(expense.category, expense);
    });
    
    const fullExpenses: Expense[] = [];
    expenseCategories.forEach(category => {
      if (expenseMap.has(category.id)) {
        fullExpenses.push(expenseMap.get(category.id));
      } else {
        fullExpenses.push({
          category: category.id,
          month,
          year,
          amount: 0,
          scope: category.scope,
          note: ""
        });
      }
    });
    setDisplayedExpenses(fullExpenses);
  };
  
  const handleMonthChange = (newMonth: number, newYear: number) => {
    setLoading(true);
    setIsDataUpdating(true);
    
    setTimeout(() => {
      setMonth(newMonth);
      setYear(newYear);
    }, 300); // Short delay before changing month/year to ensure UI updates correctly
  };

  const handleDataUpdate = async () => {
    console.log("Data update triggered");
    await loadData();
    await refreshTotalAssets();
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tổng Quan Tài Chính</h1>
            </div>
            
            <div className="mb-8">
              <MonthSelector 
                month={month} 
                year={year} 
                onChange={handleMonthChange} 
                isLoading={isDataUpdating}
              />
            </div>
            
            {loading || isDataUpdating ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-10 shadow-sm text-center">
                <div role="status" className="flex justify-center items-center flex-col">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="mt-4 text-lg dark:text-white">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <SummaryCard 
                    title="Tổng Thu Nhập" 
                    amount={totalIncome} 
                    variant="income" 
                  />
                  <SummaryCard 
                    title="Tổng Chi Tiêu" 
                    amount={totalExpense} 
                    variant="expense" 
                  />
                  <SummaryCard 
                    title="Còn Lại" 
                    amount={remaining} 
                    variant="remaining" 
                  />
                </div>
                
                {previousMonthRemaining > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Thông tin từ tháng trước</p>
                    <p className="text-sm flex justify-between dark:text-gray-300">
                      <span>Số dư còn lại tháng {previousMonthInfo}:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{new Intl.NumberFormat('vi-VN').format(previousMonthRemaining)} đ</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                      Đây chỉ là thông tin tham khảo. Hãy thêm khoản thu nhập để đưa số dư này vào tháng hiện tại.
                    </p>
                  </div>
                )}
                
                <BudgetTabs onTabChange={() => {}}>
                  {{
                    incomeTab: (
                      <IncomeTable 
                        incomes={displayedIncomes} 
                        month={month} 
                        year={year}
                        categories={incomeCategories}
                        onUpdate={handleDataUpdate} 
                      />
                    ),
                    expenseTab: (
                      <ExpenseTable 
                        expenses={displayedExpenses} 
                        month={month} 
                        year={year}
                        categories={expenseCategories}
                        onUpdate={handleDataUpdate} 
                      />
                    ),
                  }}
                </BudgetTabs>
                
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4 dark:text-white">Quản Lý Nợ</h2>
                  <DebtManagement onUpdate={handleDataUpdate} />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AssetsProvider>
      <DashboardContent />
    </AssetsProvider>
  );
}
