
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MonthSelector from "@/components/month-selector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isAuthenticated } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  total: number;
  color: string;
  percentage: number;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

const COLORS = [
  "#38B2AC", // teal
  "#4C51BF", // indigo
  "#ED64A6", // pink
  "#F6AD55", // orange
  "#9F7AEA", // purple
  "#48BB78", // green
  "#F56565", // red
  "#ECC94B", // yellow
  "#667EEA", // blue
  "#C53030", // deep red
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [incomeData, setIncomeData] = useState<Category[]>([]);
  const [expenseData, setExpenseData] = useState<Category[]>([]);
  const [balanceData, setBalanceData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    startBalance: 0,
    endBalance: 0
  });
  const [activeTab, setActiveTab] = useState("overview");
  
  // Authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);
  
  // Fetch report data
  const fetchReportData = async () => {
    try {
      // Fetch income category totals
      const incomeResponse = await api.get(`/income/categories?year=${currentYear}&month=${currentMonth}`);
      if (incomeResponse.data) {
        const total = incomeResponse.data.reduce((sum: number, item: any) => sum + item.total, 0);
        const incomesWithPercentage = incomeResponse.data.map((item: any, index: number) => ({
          ...item,
          color: COLORS[index % COLORS.length],
          percentage: total > 0 ? Math.round((item.total / total) * 100) : 0
        }));
        setIncomeData(incomesWithPercentage);
      }
      
      // Fetch expense category totals
      const expenseResponse = await api.get(`/expense/categories?year=${currentYear}&month=${currentMonth}`);
      if (expenseResponse.data) {
        const total = expenseResponse.data.reduce((sum: number, item: any) => sum + item.total, 0);
        const expensesWithPercentage = expenseResponse.data.map((item: any, index: number) => ({
          ...item,
          color: COLORS[index % COLORS.length],
          percentage: total > 0 ? Math.round((item.total / total) * 100) : 0
        }));
        setExpenseData(expensesWithPercentage);
      }
      
      // Fetch summary data
      const summaryResponse = await api.get(`/summary?year=${currentYear}&month=${currentMonth}`);
      if (summaryResponse.data) {
        setSummary({
          totalIncome: summaryResponse.data.totalIncome || 0,
          totalExpense: summaryResponse.data.totalExpense || 0,
          startBalance: summaryResponse.data.startBalance || 0,
          endBalance: summaryResponse.data.endBalance || 0
        });
      }
      
      // Fetch balance data for the chart
      const balanceResponse = await api.get(`/summary/weekly?year=${currentYear}&month=${currentMonth}`);
      if (balanceResponse.data) {
        setBalanceData(balanceResponse.data.map((item: any) => ({
          name: `${item.week}`,
          income: item.income,
          expense: item.expense
        })));
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };
  
  useEffect(() => {
    fetchReportData();
  }, [currentYear, currentMonth]);
  
  // Format data for pie charts
  const getPieChartData = (data: Category[]): ChartData[] => {
    return data.map(item => ({
      name: item.name,
      value: item.total,
      color: item.color,
      percentage: `${item.percentage}%`
    }));
  };
  
  // Handle month change
  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };
  
  return (
    <div className="flex min-h-screen bg-background dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold dark:text-white">Báo cáo tài chính</h1>
            <MonthSelector
              currentMonth={currentMonth}
              currentYear={currentYear}
              onChange={handleMonthChange}
            />
          </div>
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="income">Khoản thu</TabsTrigger>
              <TabsTrigger value="expense">Khoản chi</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Số dư đầu</span>
                      <span className="text-2xl font-bold">{formatCurrency(summary.startBalance)} đ</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Tổng thu</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(summary.totalIncome)} đ</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Tổng chi</span>
                      <span className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.totalExpense)} đ</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Số dư cuối</span>
                      <span className="text-2xl font-bold">{formatCurrency(summary.endBalance)} đ</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Thu nhập ròng</CardTitle>
                  <CardDescription>
                    Biểu đồ thu nhập và chi tiêu theo tuần
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={balanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value) + ' đ'} 
                          labelFormatter={(label) => `Tuần ${label}`}
                        />
                        <Bar dataKey="income" stackId="a" name="Thu nhập" fill="#4ade80" />
                        <Bar dataKey="expense" stackId="a" name="Chi tiêu" fill="#f87171" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle>Khoản chi</CardTitle>
                    <CardDescription>
                      Phân bổ chi tiêu theo danh mục
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      {expenseData.length > 0 ? (
                        <ChartContainer config={{
                          // config options
                        }}>
                          <PieChart width={300} height={300}>
                            <Pie
                              data={getPieChartData(expenseData)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              innerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ percentage }) => `${percentage}`}
                            >
                              {getPieChartData(expenseData).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu chi tiêu</p>
                      )}
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {expenseData.map((category) => (
                        <div key={category.id} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                          <span className="text-sm truncate">{category.name}</span>
                          <span className="text-xs text-gray-500 ml-auto">{category.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle>Khoản thu</CardTitle>
                    <CardDescription>
                      Phân bổ thu nhập theo danh mục
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      {incomeData.length > 0 ? (
                        <ChartContainer config={{
                          // config options
                        }}>
                          <PieChart width={300} height={300}>
                            <Pie
                              data={getPieChartData(incomeData)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              innerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name" 
                              label={({ percentage }) => `${percentage}`}
                            >
                              {getPieChartData(incomeData).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu thu nhập</p>
                      )}
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {incomeData.map((category) => (
                        <div key={category.id} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                          <span className="text-sm truncate">{category.name}</span>
                          <span className="text-xs text-gray-500 ml-auto">{category.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="income">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Chi tiết khoản thu</CardTitle>
                  <CardDescription>
                    Tổng thu: {formatCurrency(summary.totalIncome)} đ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[400px] flex items-center justify-center">
                      {incomeData.length > 0 ? (
                        <ChartContainer config={{
                          // config options
                        }}>
                          <PieChart width={300} height={300}>
                            <Pie
                              data={getPieChartData(incomeData)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={130}
                              innerRadius={70}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percentage }) => `${name}: ${percentage}`}
                            >
                              {getPieChartData(incomeData).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu thu nhập</p>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {incomeData.map((category) => (
                        <div key={category.id} className="border-b pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                              <span className="font-medium">{category.name}</span>
                            </div>
                            <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(category.total)} đ</span>
                          </div>
                          <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                            <div 
                              className="h-full bg-green-500 dark:bg-green-400 rounded-full" 
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{category.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="expense">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Chi tiết khoản chi</CardTitle>
                  <CardDescription>
                    Tổng chi: {formatCurrency(summary.totalExpense)} đ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[400px] flex items-center justify-center">
                      {expenseData.length > 0 ? (
                        <ChartContainer config={{
                          // config options
                        }}>
                          <PieChart width={300} height={300}>
                            <Pie
                              data={getPieChartData(expenseData)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={130}
                              innerRadius={70}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percentage }) => `${name}: ${percentage}`}
                            >
                              {getPieChartData(expenseData).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu chi tiêu</p>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {expenseData.map((category) => (
                        <div key={category.id} className="border-b pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                              <span className="font-medium">{category.name}</span>
                            </div>
                            <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(category.total)} đ</span>
                          </div>
                          <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                            <div 
                              className="h-full bg-red-500 dark:bg-red-400 rounded-full" 
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{category.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
