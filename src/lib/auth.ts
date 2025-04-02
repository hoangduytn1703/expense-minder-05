
import { toast } from "@/hooks/use-toast";

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@moneytracker.com";
const ADMIN_PASSWORD = "Admin123!";

// Database simulation for users
interface User {
  email: string;
  password: string;
  isVerified: boolean;
  isBanned: boolean;
  isAdmin: boolean;
  userId: string; // Unique ID for each user
}

// Initialize users from localStorage or use default if not exists
const getUsers = (): User[] => {
  const usersString = localStorage.getItem("users");
  if (usersString) {
    return JSON.parse(usersString);
  }
  
  // Create default admin user
  const defaultUsers: User[] = [
    {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      isVerified: true,
      isBanned: false,
      isAdmin: true,
      userId: "admin-user"
    },
    {
      email: "hoangduytn1703@gmail.com",
      password: "AkiraGosho9517",
      isVerified: true,
      isBanned: false,
      isAdmin: false,
      userId: "default-user"
    }
  ];
  
  localStorage.setItem("users", JSON.stringify(defaultUsers));
  return defaultUsers;
};

// Save users to localStorage
const saveUsers = (users: User[]): void => {
  localStorage.setItem("users", JSON.stringify(users));
};

// Generate a unique user ID
const generateUserId = (): string => {
  return 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
};

// Check if email exists
export const emailExists = (email: string): boolean => {
  const users = getUsers();
  return users.some(user => user.email.toLowerCase() === email.toLowerCase());
};

// Register a new user
export const register = (email: string, password: string): boolean => {
  // Check if email already exists
  if (emailExists(email)) {
    toast({
      title: "Đăng ký thất bại",
      description: "Email đã tồn tại trong hệ thống",
      variant: "destructive",
    });
    return false;
  }
  
  // Create new user with unique ID
  const userId = generateUserId();
  const newUser: User = {
    email,
    password,
    isVerified: false, // Not verified by default
    isBanned: false,
    isAdmin: false,
    userId
  };
  
  const users = getUsers();
  users.push(newUser);
  saveUsers(users);
  
  // Create empty data storage for new user
  initializeUserData(userId);
  
  toast({
    title: "Đăng ký thành công",
    description: "Vui lòng đăng nhập để tiếp tục",
  });
  return true;
};

// Initialize empty data for a new user
const initializeUserData = (userId: string): void => {
  // Create empty income, expense, and debt data for the user
  localStorage.setItem(`incomes_${userId}`, JSON.stringify([]));
  localStorage.setItem(`expenses_${userId}`, JSON.stringify([]));
  localStorage.setItem(`debts_${userId}`, JSON.stringify([]));
};

// Resend verification email
export const resendVerification = (email: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
  
  if (userIndex === -1) {
    toast({
      title: "Lỗi",
      description: "Email không tồn tại trong hệ thống",
      variant: "destructive",
    });
    return false;
  }
  
  // In a real app, this would send an email
  // Here we'll just simulate success
  toast({
    title: "Gửi lại email xác thực thành công",
    description: "Vui lòng kiểm tra hộp thư để xác thực tài khoản",
  });
  return true;
};

// Login checking
export const login = (email: string, password: string): boolean => {
  const users = getUsers();
  const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    toast({
      title: "Đăng nhập thất bại",
      description: "Email không tồn tại trong hệ thống",
      variant: "destructive",
    });
    return false;
  }
  
  if (user.password !== password) {
    toast({
      title: "Đăng nhập thất bại",
      description: "Mật khẩu không đúng",
      variant: "destructive",
    });
    return false;
  }
  
  if (user.isBanned) {
    toast({
      title: "Đăng nhập thất bại",
      description: "Tài khoản của bạn đã bị khóa",
      variant: "destructive",
    });
    return false;
  }
  
  // Set auth state
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("currentUser", email);
  localStorage.setItem("currentUserId", user.userId);
  localStorage.setItem("isAdmin", user.isAdmin.toString());
  
  toast({
    title: "Đăng nhập thành công",
    description: "Chào mừng bạn quay trở lại!",
  });
  return true;
};

// Check authentication status
export const isAuthenticated = (): boolean => {
  return localStorage.getItem("isAuthenticated") === "true";
};

// Check admin rights
export const isAdmin = (): boolean => {
  return localStorage.getItem("isAdmin") === "true";
};

// Get current user email
export const getCurrentUser = (): string | null => {
  return localStorage.getItem("currentUser");
};

// Get current user ID
export const getCurrentUserId = (): string | null => {
  return localStorage.getItem("currentUserId");
};

// Logout
export const logout = (): void => {
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentUserId");
  localStorage.removeItem("isAdmin");
};

// Admin functions
export const getAllUsers = (): User[] => {
  return getUsers();
};

export const addUser = (email: string, password: string, isAdmin: boolean = false): boolean => {
  if (emailExists(email)) {
    return false;
  }
  
  const userId = generateUserId();
  const newUser: User = {
    email,
    password,
    isVerified: true, // Admin-added users are verified by default
    isBanned: false,
    isAdmin,
    userId
  };
  
  const users = getUsers();
  users.push(newUser);
  saveUsers(users);
  
  // Create empty data storage for new user
  initializeUserData(userId);
  
  return true;
};

export const deleteUser = (email: string): boolean => {
  const users = getUsers();
  const userToDelete = users.find(user => user.email === email);
  
  if (!userToDelete) {
    return false; // User not found
  }
  
  const filteredUsers = users.filter(user => user.email !== email);
  
  // Remove user data
  if (userToDelete.userId) {
    localStorage.removeItem(`incomes_${userToDelete.userId}`);
    localStorage.removeItem(`expenses_${userToDelete.userId}`);
    localStorage.removeItem(`debts_${userToDelete.userId}`);
  }
  
  saveUsers(filteredUsers);
  return true;
};

export const toggleUserBan = (email: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.email === email);
  
  if (userIndex === -1) {
    return false; // User not found
  }
  
  users[userIndex].isBanned = !users[userIndex].isBanned;
  saveUsers(users);
  return true;
};
