
import { toast } from "@/hooks/use-toast";

// Thông tin đăng nhập cố định
const VALID_EMAIL = "hoangduytn1703@gmail.com";
const VALID_PASSWORD = "AkiraGosho9517";

// Kiểm tra đăng nhập
export const login = (email: string, password: string): boolean => {
  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    localStorage.setItem("isAuthenticated", "true");
    return true;
  }
  
  toast({
    title: "Đăng nhập thất bại",
    description: "Email hoặc mật khẩu không đúng",
    variant: "destructive",
  });
  return false;
};

// Kiểm tra trạng thái đăng nhập
export const isAuthenticated = (): boolean => {
  return localStorage.getItem("isAuthenticated") === "true";
};

// Đăng xuất
export const logout = (): void => {
  localStorage.removeItem("isAuthenticated");
};
