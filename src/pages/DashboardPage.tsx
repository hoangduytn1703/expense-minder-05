
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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          <div className="flex justify-center my-6">
            <MonthSelector 
              month={month} 
              year={year} 
              onChange={handleMonthChange} 
            />
          </div>
          
          {loading || isDataUpdating ? (
            <div className="text-center py-10">
              <div role="status" className="flex justify-center">
                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <SummaryCard 
                  title="Tổng thu nhập" 
                  amount={totalIncome} 
                  variant="income" 
                />
                <SummaryCard 
                  title="Tổng chi tiêu" 
                  amount={totalExpense} 
                  variant="expense" 
                />
                <SummaryCard 
                  title="Còn lại" 
                  amount={remaining} 
                  variant="remaining" 
                />
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
              
              <DebtManagement onUpdate={handleDataUpdate} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
