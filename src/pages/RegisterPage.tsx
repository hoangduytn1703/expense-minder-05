
import RegisterForm from "@/components/register-form";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Quản Lý Chi Tiêu</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Đăng ký tài khoản để bắt đầu</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
