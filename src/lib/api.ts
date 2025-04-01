
import { toast } from "@/hooks/use-toast";

// API URL - lấy từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Interface cho dữ liệu thu nhập
export interface Income {
  _id?: string;
  id?: string;
  month: number;
  year: number;
  category: string;
  amount: number;
  note?: string;
}

// Interface cho dữ liệu chi tiêu
export interface Expense {
  _id?: string;
  id?: string;
  month: number;
  year: number;
  category: string;
  scope: string;
  amount: number;
  actualAmount?: number;
  note?: string;
}

// Interface cho dữ liệu nợ
export interface Debt {
  _id?: string;
  id?: string;
  name: string;
  totalAmount: number;
  months: number;
  startMonth: number;
  startYear: number;
  note?: string;
  monthlyPayment?: number;
}

// Hàm trợ giúp gọi API
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Có lỗi xảy ra");
    }

    return await response.json();
  } catch (error) {
    console.error("API error:", error);
    toast({
      title: "Lỗi",
      description: error instanceof Error ? error.message : "Có lỗi xảy ra khi kết nối với máy chủ",
      variant: "destructive",
    });
    throw error;
  }
}

// Lấy ID thực sự từ đối tượng (có thể là id hoặc _id)
function getActualId(obj: { _id?: string; id?: string }) {
  // MongoDB thường trả về _id, nhưng frontend thường dùng id
  return obj._id || obj.id;
}

// API cho thu nhập
export const incomeAPI = {
  getByMonth: async (month: number, year: number): Promise<Income[]> => {
    return fetchAPI(`/incomes?month=${month}&year=${year}`);
  },
  create: async (income: Income): Promise<Income> => {
    return fetchAPI("/incomes", {
      method: "POST",
      body: JSON.stringify(income),
    });
  },
  update: async (id: string, income: Partial<Income>): Promise<Income> => {
    if (!id) {
      toast({
        title: "Lỗi",
        description: "ID thu nhập không hợp lệ",
        variant: "destructive",
      });
      throw new Error("ID thu nhập không hợp lệ");
    }
    return fetchAPI(`/incomes/${id}`, {
      method: "PUT",
      body: JSON.stringify(income),
    });
  },
  delete: async (id: string): Promise<void> => {
    if (!id) {
      toast({
        title: "Lỗi",
        description: "ID thu nhập không hợp lệ",
        variant: "destructive",
      });
      throw new Error("ID thu nhập không hợp lệ");
    }
    return fetchAPI(`/incomes/${id}`, {
      method: "DELETE",
    });
  },
};

// API cho chi tiêu
export const expenseAPI = {
  getByMonth: async (month: number, year: number): Promise<Expense[]> => {
    return fetchAPI(`/expenses?month=${month}&year=${year}`);
  },
  create: async (expense: Expense): Promise<Expense> => {
    return fetchAPI("/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    });
  },
  update: async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    if (!id) {
      toast({
        title: "Lỗi",
        description: "ID chi tiêu không hợp lệ",
        variant: "destructive",
      });
      throw new Error("ID chi tiêu không hợp lệ");
    }
    return fetchAPI(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(expense),
    });
  },
  delete: async (id: string): Promise<void> => {
    if (!id) {
      toast({
        title: "Lỗi",
        description: "ID chi tiêu không hợp lệ",
        variant: "destructive",
      });
      throw new Error("ID chi tiêu không hợp lệ");
    }
    return fetchAPI(`/expenses/${id}`, {
      method: "DELETE",
    });
  },
};

// API cho nợ
export const debtAPI = {
  getAll: async (): Promise<Debt[]> => {
    return fetchAPI("/debts");
  },
  create: async (debt: Debt): Promise<Debt> => {
    return fetchAPI("/debts", {
      method: "POST",
      body: JSON.stringify(debt),
    });
  },
  update: async (id: string, debt: Partial<Debt>): Promise<Debt> => {
    if (!id) {
      toast({
        title: "Lỗi",
        description: "ID khoản nợ không hợp lệ",
        variant: "destructive",
      });
      throw new Error("ID khoản nợ không hợp lệ");
    }
    return fetchAPI(`/debts/${id}`, {
      method: "PUT",
      body: JSON.stringify(debt),
    });
  },
  delete: async (id: string): Promise<void> => {
    if (!id) {
      toast({
        title: "Lỗi",
        description: "ID khoản nợ không hợp lệ",
        variant: "destructive",
      });
      throw new Error("ID khoản nợ không hợp lệ");
    }
    return fetchAPI(`/debts/${id}`, {
      method: "DELETE",
    });
  },
};

// API cho tổng quan
export const summaryAPI = {
  getMonthSummary: async (month: number, year: number): Promise<{
    totalIncome: number;
    totalExpense: number;
    remaining: number;
    previousMonthRemaining: number;
  }> => {
    return fetchAPI(`/summary?month=${month}&year=${year}`);
  },
};
