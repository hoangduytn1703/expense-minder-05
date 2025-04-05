
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => {
      setMatches(media.matches)
    }
    
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
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
  color?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color?: string;
}

export interface Debt {
  id: string;
  amount: number;
  description: string;
  dueDate: string;
  paid: boolean;
}

// API Functions
export const incomeAPI = {
  getAll: async (month: number, year: number): Promise<Income[]> => {
    const response = await fetch(`/api/incomes?month=${month}&year=${year}`);
    if (!response.ok) throw new Error('Failed to fetch incomes');
    return response.json();
  },
  
  add: async (income: Omit<Income, 'id'>): Promise<Income> => {
    const response = await fetch('/api/incomes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(income),
    });
    if (!response.ok) throw new Error('Failed to add income');
    return response.json();
  },
  
  update: async (id: string, income: Partial<Income>): Promise<Income> => {
    const response = await fetch(`/api/incomes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(income),
    });
    if (!response.ok) throw new Error('Failed to update income');
    return response.json();
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/incomes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete income');
  },
};

export const expenseAPI = {
  getAll: async (month: number, year: number): Promise<Expense[]> => {
    const response = await fetch(`/api/expenses?month=${month}&year=${year}`);
    if (!response.ok) throw new Error('Failed to fetch expenses');
    return response.json();
  },
  
  add: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });
    if (!response.ok) throw new Error('Failed to add expense');
    return response.json();
  },
  
  update: async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    const response = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });
    if (!response.ok) throw new Error('Failed to update expense');
    return response.json();
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete expense');
  },
};

export const incomeCategoryAPI = {
  getAll: async (): Promise<IncomeCategory[]> => {
    const response = await fetch('/api/income-categories');
    if (!response.ok) throw new Error('Failed to fetch income categories');
    return response.json();
  },
  
  add: async (category: Omit<IncomeCategory, 'id'>): Promise<IncomeCategory> => {
    const response = await fetch('/api/income-categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Failed to add income category');
    return response.json();
  },
  
  update: async (id: string, category: Partial<IncomeCategory>): Promise<IncomeCategory> => {
    const response = await fetch(`/api/income-categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Failed to update income category');
    return response.json();
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/income-categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete income category');
  },
};

export const expenseCategoryAPI = {
  getAll: async (): Promise<ExpenseCategory[]> => {
    const response = await fetch('/api/expense-categories');
    if (!response.ok) throw new Error('Failed to fetch expense categories');
    return response.json();
  },
  
  add: async (category: Omit<ExpenseCategory, 'id'>): Promise<ExpenseCategory> => {
    const response = await fetch('/api/expense-categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Failed to add expense category');
    return response.json();
  },
  
  update: async (id: string, category: Partial<ExpenseCategory>): Promise<ExpenseCategory> => {
    const response = await fetch(`/api/expense-categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Failed to update expense category');
    return response.json();
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/expense-categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete expense category');
  },
};

export const debtAPI = {
  getAll: async (): Promise<Debt[]> => {
    const response = await fetch('/api/debts');
    if (!response.ok) throw new Error('Failed to fetch debts');
    return response.json();
  },
  
  add: async (debt: Omit<Debt, 'id'>): Promise<Debt> => {
    const response = await fetch('/api/debts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(debt),
    });
    if (!response.ok) throw new Error('Failed to add debt');
    return response.json();
  },
  
  update: async (id: string, debt: Partial<Debt>): Promise<Debt> => {
    const response = await fetch(`/api/debts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(debt),
    });
    if (!response.ok) throw new Error('Failed to update debt');
    return response.json();
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/debts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete debt');
  },
};

export const summaryAPI = {
  getTotalAssets: async () => {
    const response = await fetch('/api/summary/assets');
    if (!response.ok) throw new Error('Failed to fetch total assets');
    return response.json();
  },
  getMonthSummary: async (month: number, year: number) => {
    const response = await fetch(`/api/summary/monthly?month=${month}&year=${year}`);
    if (!response.ok) throw new Error('Failed to fetch monthly summary');
    return response.json();
  },
  getYearlySummary: async (year: number) => {
    const response = await fetch(`/api/summary/yearly?year=${year}`);
    if (!response.ok) throw new Error('Failed to fetch yearly summary');
    return response.json();
  }
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// API aliases for backward compatibility
export const addIncomeCategoryApi = incomeCategoryAPI.add;
export const editIncomeCategoryApi = incomeCategoryAPI.update;
export const addExpenseCategoryApi = expenseCategoryAPI.add;
export const editExpenseCategoryApi = expenseCategoryAPI.update;
