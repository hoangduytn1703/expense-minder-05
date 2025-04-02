
import { toast } from "@/hooks/use-toast";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

// Mock user data for development
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    verified: true,
    createdAt: new Date().toISOString(),
  },
];

// Auth functions
export const login = async (email: string, password: string): Promise<User> => {
  try {
    // In a real app, you'd make an API request here
    // For this demo, we'll use mock data
    console.log("Logging in with:", email, password);
    
    // Find user with matching email
    const user = MOCK_USERS.find((u) => u.email === email);
    
    if (!user) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      throw new Error("Invalid email or password");
    }
    
    if (password !== "password") {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      throw new Error("Invalid email or password");
    }
    
    // Simulate successful login
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Store token in localStorage (in a real app, this would come from the server)
    const token = `mock-jwt-token-${Date.now()}`;
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<{ message: string; userId: string }> => {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Check if user already exists
    if (MOCK_USERS.some((u) => u.email === email)) {
      throw new Error("Email already in use");
    }
    
    // Create a new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: "user",
      verified: false,
      createdAt: new Date().toISOString(),
    };
    
    // In a real app, you'd save this to a database
    console.log("Registered new user:", newUser);
    
    // Return success message
    return {
      message: "Registration successful. Please check your email to verify your account.",
      userId: newUser.id,
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const verifyEmail = async (token: string): Promise<{ message: string }> => {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Validate verification token
    if (!token || token.length < 10) {
      throw new Error("Invalid verification token");
    }
    
    // In a real app, you'd update the user's verified status in the database
    console.log("Email verified with token:", token);
    
    return {
      message: "Email verified successfully. You can now log in.",
    };
  } catch (error) {
    console.error("Email verification error:", error);
    throw error;
  }
};

export const logout = (): void => {
  // Clear auth data from localStorage
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
};

export const isAuthenticated = (): boolean => {
  // Check if auth token exists in localStorage
  return Boolean(localStorage.getItem("auth_token"));
};

export const getCurrentUser = (): User | null => {
  // Get current user from localStorage
  const userJson = localStorage.getItem("user");
  if (userJson) {
    return JSON.parse(userJson);
  }
  return null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === "admin";
};

export const sendPasswordResetEmail = async (
  email: string
): Promise<{ message: string }> => {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // In a real app, you'd send a password reset email
    console.log("Password reset requested for:", email);
    
    return {
      message: "Password reset email sent. Please check your inbox.",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

// Admin functions
export const getAllUsers = async (): Promise<User[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Return mock users
  return [...MOCK_USERS];
};

export const createUser = async (user: Omit<User, "id" | "createdAt">): Promise<User> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  // In a real app, you'd save this to a database
  console.log("Created new user:", newUser);
  
  return newUser;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Find user by ID
  const user = MOCK_USERS.find((u) => u.id === id);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Update user data
  const updatedUser: User = {
    ...user,
    ...userData,
  };
  
  // In a real app, you'd update the database
  console.log("Updated user:", updatedUser);
  
  return updatedUser;
};

export const deleteUser = async (id: string): Promise<void> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // In a real app, you'd delete the user from the database
  console.log("Deleted user with ID:", id);
};

export const banUser = async (id: string): Promise<User> => {
  return updateUser(id, { role: "banned" });
};

export const unbanUser = async (id: string): Promise<User> => {
  return updateUser(id, { role: "user" });
};
