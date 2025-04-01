import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  PiggyBank, 
  BarChart3, 
  Settings, 
  CreditCard
} from "lucide-react";
import { useAssets } from "@/contexts/AssetsContext";
import { formatCurrency } from "@/lib/utils";

export default function Sidebar() {
  const { totalAssets, percentageSpent } = useAssets();

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

  return (
    <aside className="bg-white w-64 shadow-sm min-h-screen border-r">
      <div className="px-4 py-6">
        <div className="flex items-center justify-center mb-8">
          <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-teal-400 rounded-xl flex items-center justify-center text-white font-bold text-xl">M</div>
          <h2 className="text-xl font-bold ml-3 bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">MoneyTracker</h2>
        </div>
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-green-500 to-teal-400 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-3 font-medium">{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="px-4 py-6 mt-auto">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Tổng tài sản</p>
          <p className="font-bold text-lg text-gray-900">
            {formatCurrency(totalAssets)} đ
          </p>
          <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-full" 
              style={{ width: `${percentageSpent}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Thu nhập</span>
            <span>Chi tiêu</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
