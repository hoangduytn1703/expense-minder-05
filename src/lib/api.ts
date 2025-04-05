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

export interface Income {
  id?: string;
  _id?: string;
  categoryId: string;
  category?: string;
  amount: number;
  note?: string;
  month: number;
  year: number;
  date?: string;
  description?: string;
}

export interface Expense {
  id?: string;
  _id?: string;
  categoryId: string;
  category?: string;
  amount: number;
  actualAmount?: number;
  scope?: "S" | "L" | "C" | "B" | "Đ";
  note?: string;
  month: number;
  year: number;
  date?: string;
  description?: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  scope: "S" | "L" | "C" | "B" | "Đ";
}

export interface Debt {
  id?: string;
  _id?: string;
  amount: number;
  description?: string;
  dueDate?: string;
  paid?: boolean;
  totalAmount?: number;
  months?: number;
  startMonth?: number;
  startYear?: number;
  monthlyPayment?: number;
  note?: string;
  name?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

let mockIncomes: Income[] = [];
let mockExpenses: Expense[] = [];
let mockDebts: Debt[] = [];

export const incomeAPI = {
  getAll: async (month: number, year: number): Promise<Income[]> => {
    try {
      await delay(300);
      return mockIncomes.filter(income => income.month === month && income.year === year);
    } catch (error) {
      console.error("Error fetching incomes:", error);
      return [];
    }
  },
  
  add: async (income: Omit<Income, "id">): Promise<Income> => {
    try {
      await delay(300);
      const newIncome = { ...income, id: Date.now().toString() };
      mockIncomes.push(newIncome);
      return newIncome;
    } catch (error) {
      console.error("Error adding income:", error);
      throw error;
    }
  },
  
  update: async (id: string, income: Partial<Income>): Promise<Income> => {
    try {
      await delay(300);
      const index = mockIncomes.findIndex(i => i.id === id || i._id === id);
      if (index !== -1) {
        mockIncomes[index] = { ...mockIncomes[index], ...income };
        return mockIncomes[index];
      }
      throw new Error('Income not found');
    } catch (error) {
      console.error("Error updating income:", error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<void> => {
    try {
      await delay(300);
      mockIncomes = mockIncomes.filter(i => i.id !== id && i._id !== id);
    } catch (error) {
      console.error("Error deleting income:", error);
      throw error;
    }
  },

  create: async (income: Omit<Income, "id">): Promise<Income> => {
    return incomeAPI.add(income);
  },
};

export const expenseAPI = {
  getAll: async (month: number, year: number): Promise<Expense[]> => {
    try {
      await delay(300);
      return mockExpenses.filter(expense => expense.month === month && expense.year === year);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }
  },
  
  add: async (expense: Omit<Expense, "id">): Promise<Expense> => {
    try {
      await delay(300);
      const newExpense = { ...expense, id: Date.now().toString() };
      mockExpenses.push(newExpense);
      return newExpense;
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  },
  
  update: async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    try {
      await delay(300);
      const index = mockExpenses.findIndex(e => e.id === id || e._id === id);
      if (index !== -1) {
        mockExpenses[index] = { ...mockExpenses[index], ...expense };
        return mockExpenses[index];
      }
      throw new Error('Expense not found');
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<void> => {
    try {
      await delay(300);
      mockExpenses = mockExpenses.filter(e => e.id !== id && e._id !== id);
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  },

  create: async (expense: Omit<Expense, "id">): Promise<Expense> => {
    return expenseAPI.add(expense);
  },

  getByMonth: async (month: number, year: number): Promise<Expense[]> => {
    return expenseAPI.getAll(month, year);
  }
};

export const incomeCategoryAPI = {
  getAll: async (): Promise<IncomeCategory[]> => {
    try {
      await delay(300);
      return [...mockIncomeCategories];
    } catch (error) {
      console.error("Error fetching income categories:", error);
      return [];
    }
  },
  
  add: async (category: IncomeCategory): Promise<IncomeCategory> => {
    try {
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
      await delay(300);
      return [...mockExpenseCategories];
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      return [];
    }
  },
  
  add: async (category: ExpenseCategory): Promise<ExpenseCategory> => {
    try {
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

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const addIncomeCategoryApi = incomeCategoryAPI.add;
export const editIncomeCategoryApi = incomeCategoryAPI.update;
export const addExpenseCategoryApi = expenseCategoryAPI.add;
export const editExpenseCategoryApi = expenseCategoryAPI.update;
