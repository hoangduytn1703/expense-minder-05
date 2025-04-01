
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
  
  // Kiểm tra xác thực
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);
  
  // Tải dữ liệu khi tháng hoặc năm thay đổi
  const loadData = async () => {
    setLoading(true);
    try {
      // Tải dữ liệu tổng quan
      const summary = await summaryAPI.getMonthSummary(month, year);
      console.log("Summary data:", summary);
      
      setTotalIncome(summary.totalIncome);
      setTotalExpense(summary.totalExpense);
      setRemaining(summary.remaining);
      setPreviousMonthRemaining(summary.previousMonthRemaining);
      
      // Tải thu nhập
      const incomesData = await incomeAPI.getByMonth(month, year);
      setIncomes(incomesData);
      
      // Tải chi tiêu
      const expensesData = await expenseAPI.getByMonth(month, year);
      setExpenses(expensesData);
      
      // Cập nhật khoản còn lại của tháng trước (nếu cần)
      await updatePreviousMonthRemaining(summary.previousMonthRemaining);
      
      // Chuẩn bị dữ liệu hiển thị cho tất cả các danh mục
      prepareDisplayData(incomesData, expensesData);
      
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Chuẩn bị dữ liệu hiển thị đầy đủ cho tất cả các danh mục
  const prepareDisplayData = (incomesData: Income[], expensesData: Expense[]) => {
    // Chuẩn bị dữ liệu thu nhập
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
    
    // Chuẩn bị dữ liệu chi tiêu
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
  
  useEffect(() => {
    loadData();
  }, [month, year]);
  
  // Hàm cập nhật khoản còn lại tháng trước
  const updatePreviousMonthRemaining = async (amount: number) => {
    try {
      // Kiểm tra xem đã có mục "Tiền còn tháng trước" chưa
      const previousMonthEntry = incomes.find(income => income.category === "previousMonth");
      
      if (amount > 0) {
        if (previousMonthEntry) {
          // Cập nhật nếu đã tồn tại
          if (previousMonthEntry.amount !== amount) {
            const id = previousMonthEntry._id || previousMonthEntry.id;
            if (id) {
              await incomeAPI.update(id, { amount });
            }
          }
        } else {
          // Thêm mới nếu chưa tồn tại
          await incomeAPI.create({
            month,
            year,
            category: "previousMonth",
            amount,
            note: "Tự động cập nhật từ tháng trước",
          });
          
          // Tải lại thu nhập sau khi thêm mới
          const incomesData = await incomeAPI.getByMonth(month, year);
          setIncomes(incomesData);
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật khoản còn lại tháng trước:", error);
    }
  };
  
  // Xử lý khi tháng/năm thay đổi
  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
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
          
          {loading ? (
            <div className="text-center py-10">Đang tải dữ liệu...</div>
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
                      onUpdate={loadData} 
                    />
                  ),
                  expenseTab: (
                    <ExpenseTable 
                      expenses={displayedExpenses} 
                      month={month} 
                      year={year}
                      categories={expenseCategories}
                      onUpdate={loadData} 
                    />
                  ),
                }}
              </BudgetTabs>
              
              <DebtManagement onUpdate={loadData} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
