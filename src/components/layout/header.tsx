
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Quản Lý Chi Tiêu</h1>
        <Button variant="outline" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}
