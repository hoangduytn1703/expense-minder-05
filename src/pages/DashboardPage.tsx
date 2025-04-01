
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

export default function DashboardPage() {
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
  const [previousMonthDate, setPreviousMonthDate] = useState("");
  const [displayedIncomes, setDisplayedIncomes] = useState<Income[]>([]);
  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
  const [isDataUpdating, setIsDataUpdating] = useState(false);
  
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
      setPreviousMonthDate(summary.previousMonthDate || "");
      
      // Fetch incomes and expenses data
      const incomesData = await incomeAPI.getByMonth(month, year);
      console.log("Income data:", incomesData);
      setIncomes(incomesData);
      
      const expensesData = await expenseAPI.getByMonth(month, year);
      setExpenses(expensesData);
      
      if (summary.shouldUpdatePreviousMonth) {
        console.log("Updating previous month remaining:", summary.previousMonthRemaining);
        await updatePreviousMonthRemaining(summary.previousMonthRemaining);
        
        // Re-fetch summary after updating previousMonth amount
        setTimeout(async () => {
          const updatedSummary = await summaryAPI.getMonthSummary(month, year);
          setTotalIncome(updatedSummary.totalIncome);
          setTotalExpense(updatedSummary.totalExpense);
          setRemaining(updatedSummary.remaining);
          
          // Re-fetch incomes after updating previousMonth amount
          const updatedIncomesData = await incomeAPI.getByMonth(month, year);
          setIncomes(updatedIncomesData);
          prepareDisplayData(updatedIncomesData, expensesData);
          
          setTimeout(() => {
            setLoading(false);
            setIsDataUpdating(false);
          }, 1000);
        }, 1000);
      } else {
        prepareDisplayData(incomesData, expensesData);
        setTimeout(() => {
          setLoading(false);
          setIsDataUpdating(false);
        }, 1000);
      }
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
  
  const updatePreviousMonthRemaining = async (amount: number) => {
    try {
      const previousMonthEntry = incomes.find(income => income.category === "previousMonth");
      
      if (previousMonthEntry) {
        // If entry exists, update it
        if (previousMonthEntry.amount !== amount) {
          const id = previousMonthEntry._id || previousMonthEntry.id;
          if (id) {
            await incomeAPI.update(id, { 
              amount, 
              note: `Tự động cập nhật từ tháng trước: ${new Date().toLocaleDateString()}`
            });
            console.log("Updated previous month entry:", amount);
          }
        }
      } else if (amount > 0) {
        // If entry does not exist, create it
        await incomeAPI.create({
          month,
          year,
          category: "previousMonth",
          amount,
          note: `Tự động cập nhật từ tháng trước: ${new Date().toLocaleDateString()}`
        });
        console.log("Created new previous month entry:", amount);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật khoản còn lại tháng trước:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật số dư tháng trước.",
        variant: "destructive",
      });
    }
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
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Tổng Quan Tài Chính</h1>
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
              <div className="bg-white rounded-xl p-10 shadow-sm text-center">
                <div role="status" className="flex justify-center items-center flex-col">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="mt-4 text-lg">Đang tải dữ liệu...</p>
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
                
                <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
                  <p className="text-gray-500 mb-2">Thông tin cập nhật</p>
                  <p className="text-sm">Số dư còn lại từ tháng trước ({previousMonthDate}): <span className="font-semibold">{new Intl.NumberFormat('vi-VN').format(previousMonthRemaining)} đ</span></p>
                </div>
                
                <BudgetTabs>
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
                
                <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Quản Lý Nợ</h2>
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
