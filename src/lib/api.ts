
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => {
      setMatches(media.matches);
    };
    
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

// API Types
export interface Income {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  month: number;
  year: number;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  month: number;
  year: number;
}

export interface IncomeCategory {
  id: string;
  name: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  scope: string;
}

export interface Debt {
  id: string;
  amount: number;
  description: string;
  dueDate: string;
  paid: boolean;
}

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for categories
let mockIncomeCategories: IncomeCategory[] = [
  { id: "salary", name: "Lương cứng" },
  { id: "bonus", name: "Thưởng/OT" },  
  { id: "freelance", name: "Freelance" },
  { id: "debtCollection", name: "Thu nợ" },
  { id: "monthlyBalance", name: "Tiền từ tháng trước" },
  { id: "advance", name: "Tiền nhậu" },
  { id: "hui", name: "Hụi" },
  { id: "other", name: "Khác" }
];

let mockExpenseCategories: ExpenseCategory[] = [
  { id: "rent", name: "Tiền trọ", scope: "S" },
  { id: "sendHome", name: "Gửi về nhà", scope: "S" },
  { id: "breakfast", name: "Ăn sáng", scope: "S" },
  { id: "lunch", name: "Ăn trưa", scope: "S" },
  { id: "dinner", name: "Ăn tối", scope: "S" },
  { id: "transport", name: "Đi lại/ Xăng", scope: "S" },
  { id: "shopping", name: "Mua sắm", scope: "S" },
  { id: "fee", name: "Chi phí", scope: "S" },
  { id: "entertainment", name: "Giải trí, yêu đương", scope: "L" },
  { id: "longTermSaving", name: "Để dành (lâu dài)", scope: "C" },
  { id: "emergencySaving", name: "Để dành (sơ cua, bệnh hoạn)", scope: "B" },
  { id: "investment", name: "Đầu Tư", scope: "Đ" },
  { id: "debtPayment", name: "Trả nợ", scope: "S" },
  { id: "creditPayment", name: "Trả tín dụng", scope: "S" },
  { id: "additional", name: "Phát sinh thêm", scope: "S" },
  { id: "special", name: "Đặc biệt", scope: "S" }
];

// API Functions
export const incomeAPI = {
  getAll: async (month: number, year: number): Promise<Income[]> => {
    try {
      const response = await fetch(`/api/incomes?month=${month}&year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch incomes');
      return response.json();
    } catch (error) {
      console.error("Error fetching incomes:", error);
      return [];
    }
  },
  
  add: async (income: Omit<Income, 'id'>): Promise<Income> => {
    try {
      const response = await fetch('/api/incomes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(income),
      });
      if (!response.ok) throw new Error('Failed to add income');
      return response.json();
    } catch (error) {
      console.error("Error adding income:", error);
      throw error;
    }
  },
  
  update: async (id: string, income: Partial<Income>): Promise<Income> => {
    try {
      const response = await fetch(`/api/incomes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(income),
      });
      if (!response.ok) throw new Error('Failed to update income');
      return response.json();
    } catch (error) {
      console.error("Error updating income:", error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/incomes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete income');
    } catch (error) {
      console.error("Error deleting income:", error);
      throw error;
    }
  },
};

export const expenseAPI = {
  getAll: async (month: number, year: number): Promise<Expense[]> => {
    try {
      const response = await fetch(`/api/expenses?month=${month}&year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      return response.json();
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }
  },
  
  add: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });
      if (!response.ok) throw new Error('Failed to add expense');
      return response.json();
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  },
  
  update: async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });
      if (!response.ok) throw new Error('Failed to update expense');
      return response.json();
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete expense');
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  },
};

export const incomeCategoryAPI = {
  getAll: async (): Promise<IncomeCategory[]> => {
    try {
      // Simulate API call to get income categories
      await delay(300);
      return [...mockIncomeCategories];
    } catch (error) {
      console.error("Error fetching income categories:", error);
      return [];
    }
  },
  
  add: async (category: IncomeCategory): Promise<IncomeCategory> => {
    try {
      // Simulate API call to add income category
      await delay(300);
      mockIncomeCategories.push(category);
      return category;
    } catch (error) {
      console.error("Error adding income category:", error);
      throw error;
    }
  },
  
  update: async (id: string, category: Partial<IncomeCategory>): Promise<IncomeCategory> => {
    try {
      // Simulate API call to update income category
      await delay(300);
      const index = mockIncomeCategories.findIndex(c => c.id === id);
      if (index !== -1) {
        mockIncomeCategories[index] = { ...mockIncomeCategories[index], ...category };
        return mockIncomeCategories[index];
      }
      throw new Error('Income category not found');
    } catch (error) {
      console.error("Error updating income category:", error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<void> => {
    try {
      // Simulate API call to delete income category
      await delay(300);
      mockIncomeCategories = mockIncomeCategories.filter(c => c.id !== id);
    } catch (error) {
      console.error("Error deleting income category:", error);
      throw error;
    }
  },
};

export const expenseCategoryAPI = {
  getAll: async (): Promise<ExpenseCategory[]> => {
    try {
      // Simulate API call to get expense categories
      await delay(300);
      return [...mockExpenseCategories];
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      return [];
    }
  },
  
  add: async (category: ExpenseCategory): Promise<ExpenseCategory> => {
    try {
      // Simulate API call to add expense category
      await delay(300);
      mockExpenseCategories.push(category);
      return category;
    } catch (error) {
      console.error("Error adding expense category:", error);
      throw error;
    }
  },
  
  update: async (id: string, category: Partial<ExpenseCategory>): Promise<ExpenseCategory> => {
    try {
      // Simulate API call to update expense category
      await delay(300);
      const index = mockExpenseCategories.findIndex(c => c.id === id);
      if (index !== -1) {
        mockExpenseCategories[index] = { ...mockExpenseCategories[index], ...category };
        return mockExpenseCategories[index];
      }
      throw new Error('Expense category not found');
    } catch (error) {
      console.error("Error updating expense category:", error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<void> => {
    try {
      // Simulate API call to delete expense category
      await delay(300);
      mockExpenseCategories = mockExpenseCategories.filter(c => c.id !== id);
    } catch (error) {
      console.error("Error deleting expense category:", error);
      throw error;
    }
  },
};

export const debtAPI = {
  getAll: async (): Promise<Debt[]> => {
    try {
      const response = await fetch('/api/debts');
      if (!response.ok) throw new Error('Failed to fetch debts');
      return response.json();
    } catch (error) {
      console.error("Error fetching debts:", error);
      return [];
    }
  },
  
  add: async (debt: Omit<Debt, 'id'>): Promise<Debt> => {
    try {
      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debt),
      });
      if (!response.ok) throw new Error('Failed to add debt');
      return response.json();
    } catch (error) {
      console.error("Error adding debt:", error);
      throw error;
    }
  },
  
  update: async (id: string, debt: Partial<Debt>): Promise<Debt> => {
    try {
      const response = await fetch(`/api/debts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debt),
      });
      if (!response.ok) throw new Error('Failed to update debt');
      return response.json();
    } catch (error) {
      console.error("Error updating debt:", error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/debts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete debt');
    } catch (error) {
      console.error("Error deleting debt:", error);
      throw error;
    }
  },
};

export const summaryAPI = {
  getTotalAssets: async () => {
    try {
      const response = await fetch('/api/summary/assets');
      if (!response.ok) throw new Error('Failed to fetch total assets');
      return response.json();
    } catch (error) {
      console.error("Error fetching total assets:", error);
      // Return mock data for demonstration
      return { totalAssets: 5000000 };
    }
  },
  getMonthSummary: async (month: number, year: number) => {
    try {
      const response = await fetch(`/api/summary/monthly?month=${month}&year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch monthly summary');
      return response.json();
    } catch (error) {
      console.error("Error fetching monthly summary:", error);
      return { incomeTotal: 0, expenseTotal: 0 };
    }
  },
  getYearlySummary: async (year: number) => {
    try {
      const response = await fetch(`/api/summary/yearly?year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch yearly summary');
      return response.json();
    } catch (error) {
      console.error("Error fetching yearly summary:", error);
      return [];
    }
  }
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// API aliases for backward compatibility
export const addIncomeCategoryApi = incomeCategoryAPI.add;
export const editIncomeCategoryApi = incomeCategoryAPI.update;
export const addExpenseCategoryApi = expenseCategoryAPI.add;
export const editExpenseCategoryApi = expenseCategoryAPI.update;
