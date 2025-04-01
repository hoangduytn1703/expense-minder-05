
import LoginForm from "@/components/login-form";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  
  // Kiểm tra nếu đã đăng nhập thì chuyển đến trang dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold">Quản Lý Chi Tiêu</h1>
          <p className="mt-2 text-gray-600">Đăng nhập để quản lý chi tiêu cá nhân</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
