
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Bell } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">Quản Lý Chi Tiêu</h1>
        
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
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  );
}
