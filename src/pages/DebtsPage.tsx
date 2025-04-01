
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import DebtManagement from "@/components/debt-management";
import { isAuthenticated } from "@/lib/auth";

export default function DebtsPage() {
  const navigate = useNavigate();
  
  // Kiểm tra xác thực
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Quản lý nợ</h1>
          <DebtManagement onUpdate={() => {}} />
        </main>
      </div>
    </div>
  );
}
