
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import DebtManagement from "@/components/debt-management";
import { isAuthenticated } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { debtAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank } from "lucide-react";
import AddDebtDialog from "@/components/add-debt-dialog";

export default function DebtsPage() {
  const navigate = useNavigate();
  const [totalDebt, setTotalDebt] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Kiểm tra xác thực
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  // Fetch total debt
  const fetchTotalDebt = async () => {
    try {
      const debts = await debtAPI.getAll();
      const total = debts.reduce((sum, debt) => sum + debt.totalAmount, 0);
      setTotalDebt(total);
    } catch (error) {
      console.error("Error fetching total debt:", error);
    }
  };

  useEffect(() => {
    fetchTotalDebt();
  }, [refreshTrigger]);
  
  const handleUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="flex min-h-screen bg-background dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold dark:text-white">Quản lý nợ</h1>
            <AddDebtDialog onUpdate={handleUpdate} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="flex items-center p-6">
                <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mr-4">
                  <PiggyBank className="h-7 w-7 text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Tổng nợ</h3>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalDebt)} đ</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DebtManagement onUpdate={handleUpdate} />
        </main>
      </div>
    </div>
  );
}
