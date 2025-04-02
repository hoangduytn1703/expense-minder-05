
import { toast } from "@/hooks/use-toast";

// User structure
export interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: Date;
  lastLogin: Date;
}

// Mock database for users
const USERS_KEY = 'expense_tracker_users';
const CURRENT_USER_KEY = 'expense_tracker_current_user';
const VERIFICATION_TOKENS_KEY = 'expense_tracker_verification_tokens';

// Admin credentials
const ADMIN_EMAIL = "hoangduytn1703@gmail.com";
const ADMIN_PASSWORD = "AkiraGosho9517";

// Helper to get users from localStorage
const getUsers = (): Record<string, User> => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : {};
};

// Helper to save users to localStorage
const saveUsers = (users: Record<string, User>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Helper to get verification tokens
const getVerificationTokens = (): Record<string, { email: string, expires: number }> => {
  const tokens = localStorage.getItem(VERIFICATION_TOKENS_KEY);
  return tokens ? JSON.parse(tokens) : {};
};

// Helper to save verification tokens
const saveVerificationTokens = (tokens: Record<string, { email: string, expires: number }>) => {
  localStorage.setItem(VERIFICATION_TOKENS_KEY, JSON.stringify(tokens));
};

// Check if a user with the given email exists
export const userExists = (email: string): boolean => {
  const users = getUsers();
  return !!users[email.toLowerCase()];
};

// Generate a simple verification token
const generateToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Register a new user
export const register = (email: string, password: string, name: string): { success: boolean; message: string } => {
  // Validate inputs
  if (!email || !password || !name) {
    return { success: false, message: "Vui lòng điền đầy đủ thông tin" };
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: "Email không hợp lệ" };
  }

  // Password strength validation (at least 8 characters)
  if (password.length < 8) {
    return { success: false, message: "Mật khẩu phải có ít nhất 8 ký tự" };
  }

  const emailLower = email.toLowerCase();
  
  // Check if user already exists
  const users = getUsers();
  if (users[emailLower]) {
    return { success: false, message: "Email này đã được sử dụng" };
  }

  // Create user object
  const newUser: User = {
    id: Date.now().toString(),
    email: emailLower,
    name,
    isVerified: false,
    isAdmin: emailLower === ADMIN_EMAIL,
    createdAt: new Date(),
    lastLogin: new Date()
  };

  // Store user with hashed password (in a real app, we would hash the password)
  users[emailLower] = newUser;
  saveUsers(users);

  // Create verification token (valid for 24 hours)
  const token = generateToken();
  const tokens = getVerificationTokens();
  tokens[token] = {
    email: emailLower,
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  saveVerificationTokens(tokens);

  // In a real app, send verification email here
  console.log(`Verification link: /verify?token=${token}`);

  // Return success
  return { 
    success: true, 
    message: "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản." 
  };
};

// Verify a user's email
export const verifyEmail = (token: string): { success: boolean; message: string } => {
  const tokens = getVerificationTokens();
  const tokenData = tokens[token];

  if (!tokenData) {
    return { success: false, message: "Token không hợp lệ hoặc đã hết hạn" };
  }

  if (tokenData.expires < Date.now()) {
    // Remove expired token
    delete tokens[token];
    saveVerificationTokens(tokens);
    return { success: false, message: "Token đã hết hạn. Vui lòng đăng ký lại" };
  }

  // Update user status
  const users = getUsers();
  const user = users[tokenData.email];
  
  if (!user) {
    return { success: false, message: "Không tìm thấy người dùng" };
  }

  user.isVerified = true;
  saveUsers(users);

  // Remove used token
  delete tokens[token];
  saveVerificationTokens(tokens);

  return { success: true, message: "Email đã được xác minh. Bạn có thể đăng nhập ngay bây giờ" };
};

// Resend verification email
export const resendVerification = (email: string): { success: boolean; message: string } => {
  const emailLower = email.toLowerCase();
  const users = getUsers();
  const user = users[emailLower];

  if (!user) {
    return { success: false, message: "Email không tồn tại trong hệ thống" };
  }

  if (user.isVerified) {
    return { success: false, message: "Email này đã được xác minh" };
  }

  // Create new verification token
  const token = generateToken();
  const tokens = getVerificationTokens();
  tokens[token] = {
    email: emailLower,
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  saveVerificationTokens(tokens);

  // In a real app, send verification email here
  console.log(`New verification link: /verify?token=${token}`);

  return { success: true, message: "Email xác minh mới đã được gửi" };
};

// Login function
export const login = (email: string, password: string): boolean => {
  // Special case for the admin
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const adminUser: User = {
      id: "admin",
      email: ADMIN_EMAIL,
      name: "Admin",
      isVerified: true,
      isAdmin: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
    return true;
  }
  
  const users = getUsers();
  const emailLower = email.toLowerCase();
  const user = users[emailLower];
  
  // Check if user exists
  if (!user) {
    toast({
      title: "Đăng nhập thất bại",
      description: "Email không tồn tại",
      variant: "destructive",
    });
    return false;
  }
  
  // In a real app, we would check the password hash here
  // For now, we just assume the password is correct
  
  // Check if user is verified
  if (!user.isVerified) {
    toast({
      title: "Đăng nhập thất bại",
      description: "Email chưa được xác minh. Vui lòng kiểm tra email của bạn",
      variant: "destructive",
    });
    return false;
  }
  
  // Update last login time
  user.lastLogin = new Date();
  saveUsers(users);
  
  // Save current user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  
  return true;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

// Check if user is an admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user ? user.isAdmin : false;
};

// Get current user
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Logout
export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Admin functions
// Get all users
export const getAllUsers = (): User[] => {
  if (!isAdmin()) return [];
  
  const users = getUsers();
  return Object.values(users);
};

// Ban a user
export const banUser = (email: string): { success: boolean; message: string } => {
  if (!isAdmin()) {
    return { success: false, message: "Không có quyền thực hiện hành động này" };
  }
  
  const users = getUsers();
  const user = users[email.toLowerCase()];
  
  if (!user) {
    return { success: false, message: "Không tìm thấy người dùng" };
  }
  
  // Remove user
  delete users[email.toLowerCase()];
  saveUsers(users);
  
  return { success: true, message: "Đã xóa người dùng thành công" };
};

// Add a user (admin only)
export const addUser = (email: string, name: string, isAdmin: boolean = false): { success: boolean; message: string } => {
  if (!isAdmin()) {
    return { success: false, message: "Không có quyền thực hiện hành động này" };
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: "Email không hợp lệ" };
  }
  
  const emailLower = email.toLowerCase();
  const users = getUsers();
  
  // Check if user already exists
  if (users[emailLower]) {
    return { success: false, message: "Email đã tồn tại trong hệ thống" };
  }
  
  // Create user object
  const newUser: User = {
    id: Date.now().toString(),
    email: emailLower,
    name,
    isVerified: true, // Admin-created accounts are verified by default
    isAdmin,
    createdAt: new Date(),
    lastLogin: new Date()
  };
  
  users[emailLower] = newUser;
  saveUsers(users);
  
  return { success: true, message: "Đã thêm người dùng thành công" };
};
