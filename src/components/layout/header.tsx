
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun, Bell, Wallet } from "lucide-react";
import { useAssets } from "@/contexts/AssetsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatCurrency } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";

export default function Header() {
  const navigate = useNavigate();
  const { totalAssets } = useAssets();
  const { theme, toggleTheme } = useTheme();
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent">Quản Lý Chi Tiêu</h1>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
            <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium dark:text-white">Tổng tài sản:</span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(totalAssets)} đ</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-300">
              <Bell className="h-5 w-5" />
            </Button>
            <Toggle 
              pressed={theme === "dark"}
              onPressedChange={toggleTheme} 
              aria-label="Toggle theme"
              className="text-gray-500 dark:text-gray-300"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Toggle>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm dark:border-gray-600 dark:text-white"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
