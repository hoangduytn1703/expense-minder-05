
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  BarChart3, 
  Settings, 
  CreditCard,
  Menu,
  Folder
} from "lucide-react";
import { useAssets } from "@/contexts/AssetsContext";
import { formatCurrency } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { totalAssets, totalDebts } = useAssets();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);
  
  const menuItems = [
    {
      name: "Tổng quan",
      path: "/dashboard",
      icon: Home
    },
    {
      name: "Quản lý nợ",
      path: "/debts",
      icon: CreditCard 
    },
    {
      name: "Danh mục",
      path: "/categories",
      icon: Folder
    },
    {
      name: "Báo cáo",
      path: "/reports",
      icon: BarChart3
    },
    {
      name: "Cài đặt",
      path: "/admin",
      icon: Settings
    }
  ];
  
  return (
    <div
      className={cn(
        "border-r bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-50 transition-all duration-300 flex flex-col h-screen",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="p-4 border-b flex items-center gap-2">
        {!isCollapsed && (
          <div className="flex-1">
            <h2 className="text-xl font-bold">Quản lý</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tài chính cá nhân</p>
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-between py-4 relative">
        {/* Collapse toggle button */}
        <Button
          size="sm"
          variant="outline"
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
                    cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                      isActive 
                        ? "bg-gray-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400 font-medium" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-800",
                      isCollapsed && "justify-center px-2"
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.name}</span>}
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
            <p className={`text-lg font-semibold text-green-600 mb-2 ${isCollapsed ? "text-center" : ""}`}>
              {formatCurrency(totalAssets)} đ
            </p>
            
            <p className={`text-sm text-gray-600 dark:text-gray-300 mt-4 ${isCollapsed ? "text-center" : ""}`}>
              {!isCollapsed ? "Tổng nợ" : "Nợ"}
            </p>
            <p className={`text-lg font-semibold text-red-600 ${isCollapsed ? "text-center" : ""}`}>
              {formatCurrency(totalDebts)} đ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
