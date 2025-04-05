
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  PiggyBank, 
  BarChart3, 
  Settings, 
  CreditCard,
  Menu
} from "lucide-react";
import { useAssets } from "@/contexts/AssetsContext";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { debtAPI } from "@/lib/api";

export default function Sidebar() {
  const { totalAssets, percentageSpent } = useAssets();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [totalDebt, setTotalDebt] = useState(0);

  const menuItems = [
    {
      title: "Tổng Quan",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Quản lý nợ",
      path: "/debts",
      icon: <PiggyBank className="h-5 w-5" />,
    },
    {
      title: "Báo cáo",
      path: "/reports",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Thẻ tín dụng",
      path: "/credit",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Cài đặt",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    }
  ];

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
  }, []);

  return (
    <aside 
      className={`bg-white dark:bg-gray-800 min-h-screen border-r dark:border-gray-700 relative transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="px-4 py-6 h-full flex flex-col">
        <div className="flex items-center justify-center mb-8">
          {!isCollapsed && (
            <>
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-teal-400 rounded-xl flex items-center justify-center text-white font-bold text-xl">M</div>
              <h2 className="text-xl font-bold ml-3 bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">MoneyTracker</h2>
            </>
          )}
          {isCollapsed && (
            <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-teal-400 rounded-xl flex items-center justify-center text-white font-bold text-xl">M</div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white dark:bg-gray-700 shadow-md rounded-full border border-gray-200 dark:border-gray-600 z-10"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <nav className="mb-6">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? "justify-center" : "px-4"} py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-green-500 to-teal-400 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                    }`
                  }
                >
                  {item.icon}
                  {!isCollapsed && <span className="ml-3 font-medium">{item.title}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className={`px-4 py-4 ${isCollapsed ? "text-center" : ""} mt-6 border-t border-gray-200 dark:border-gray-700`}>
          <div className={`bg-gray-50 dark:bg-gray-700 p-4 rounded-lg ${isCollapsed ? "text-center" : ""}`}>
            <p className={`text-sm text-gray-600 dark:text-gray-300 ${isCollapsed ? "text-center" : ""}`}>
              {!isCollapsed ? "Tổng tài sản" : "TS"}
            </p>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {formatCurrency(totalAssets)} đ
            </p>
            
            {!isCollapsed && (
              <>
                <div className="mt-2 h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ width: `${percentageSpent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>Thu nhập</span>
                  <span>Chi tiêu</span>
                </div>
              </>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className={`text-sm text-gray-600 dark:text-gray-300 ${isCollapsed ? "text-center" : ""}`}>
                {!isCollapsed ? "Tổng nợ" : "Nợ"}
              </p>
              <p className="font-bold text-lg text-red-500 dark:text-red-400">
                {formatCurrency(totalDebt)} đ
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
