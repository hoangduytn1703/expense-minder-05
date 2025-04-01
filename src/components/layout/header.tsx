
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Bell, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { summaryAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function Header() {
  const navigate = useNavigate();
  const [totalAssets, setTotalAssets] = useState(0);
  
  useEffect(() => {
    const fetchTotalAssets = async () => {
      try {
        const response = await summaryAPI.getTotalAssets();
        setTotalAssets(response.totalAssets);
      } catch (error) {
        console.error("Error fetching total assets:", error);
      }
    };
    
    fetchTotalAssets();
    
    // Set up interval to refresh data every 60 seconds
    const intervalId = setInterval(fetchTotalAssets, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent">Quản Lý Chi Tiêu</h1>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Wallet className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Tổng tài sản:</span>
            <span className="text-sm font-bold text-green-600">{formatCurrency(totalAssets)} đ</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Moon className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm"
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
