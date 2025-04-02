
import { toast } from "@/hooks/use-toast";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string;
  lastLogin?: string;
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
    lastLogin: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    verified: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
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

    // Update last login
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString()
    };
    
    return updatedUser;
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

export const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Validate verification token
    if (!token || token.length < 10) {
      return {
        success: false,
        message: "Invalid verification token"
      };
    }
    
    // In a real app, you'd update the user's verified status in the database
    console.log("Email verified with token:", token);
    
    return {
      success: true,
      message: "Email verified successfully. You can now log in.",
    };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      success: false,
      message: "Verification failed. Please try again."
    };
  }
};

export const resendVerification = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // In a real app, you'd check if the email exists and send a new verification email
    console.log("Resending verification to:", email);
    
    return {
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
    };
  } catch (error) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      message: "Failed to resend verification email. Please try again.",
    };
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

export const createUser = async (userData: Omit<User, "id" | "createdAt">): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Check if email already exists
    if (MOCK_USERS.some(u => u.email === userData.email)) {
      return {
        success: false,
        message: "Email already in use"
      };
    }
    
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    // In a real app, you'd save this to a database
    console.log("Created new user:", newUser);
    
    return {
      success: true,
      message: "User created successfully",
      user: newUser
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: "Failed to create user"
    };
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Find user by ID
    const user = MOCK_USERS.find((u) => u.id === id);
    
    if (!user) {
      return {
        success: false,
        message: "User not found"
      };
    }
    
    // Update user data
    const updatedUser: User = {
      ...user,
      ...userData,
    };
    
    // In a real app, you'd update the database
    console.log("Updated user:", updatedUser);
    
    return {
      success: true,
      message: "User updated successfully",
      user: updatedUser
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message: "Failed to update user"
    };
  }
};

export const deleteUser = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // In a real app, you'd delete the user from the database
    console.log("Deleted user with ID:", id);
    
    return {
      success: true,
      message: "User deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: "Failed to delete user"
    };
  }
};

export const banUser = async (id: string): Promise<{ success: boolean; message: string; user?: User }> => {
  return updateUser(id, { role: "banned" });
};

export const unbanUser = async (id: string): Promise<{ success: boolean; message: string; user?: User }> => {
  return updateUser(id, { role: "user" });
};
