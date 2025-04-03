
export interface Income {
  id?: string;
  _id?: string;
  month: number;
  year: number;
  category: string;
  amount: number;
  note: string;
}

export interface Expense {
  id?: string;
  _id?: string;
  month: number;
  year: number;
  category: string;
  amount: number;
  actualAmount?: number;
  scope: string;
  note: string;
}

export interface Debt {
  id?: string;
  _id?: string;
  creditor: string;
  description: string;
  totalAmount: number;
  amount: number;
  remainingAmount: number;
  paymentDate: string;
  lastPaymentDate?: string;
  userId: string;
  // Added fields that were missing
  name: string;
  note: string;
  months: number;
  monthlyPayment?: number;
  startMonth: number;
  startYear: number;
  isPaid?: boolean;
}

export interface Summary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  remaining: number;
  previousMonthRemaining: number;
  totalAllTimeIncome?: number;
  totalAllTimeExpense?: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const request = async (path: string, method: string, data?: any) => {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${path}`, config);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch");
  }

  return await response.json();
};

export const incomeAPI = {
  getByMonth: (month: number, year: number) =>
    request(`/incomes?month=${month}&year=${year}`, "GET") as Promise<Income[]>,
  add: (income: Omit<Income, "id" | "_id">) => request("/incomes", "POST", income),
  update: (id: string, income: Omit<Income, "id" | "_id">) =>
    request(`/incomes/${id}`, "PUT", income),
  delete: (id: string) => request(`/incomes/${id}`, "DELETE"),
  // For backward compatibility
  create: (income: Omit<Income, "id" | "_id">) => request("/incomes", "POST", income)
};

export const expenseAPI = {
  getByMonth: (month: number, year: number) =>
    request(`/expenses?month=${month}&year=${year}`, "GET") as Promise<Expense[]>,
  add: (expense: Omit<Expense, "id" | "_id">) => request("/expenses", "POST", expense),
  update: (id: string, expense: Omit<Expense, "id" | "_id">) =>
    request(`/expenses/${id}`, "PUT", expense),
  delete: (id: string) => request(`/expenses/${id}`, "DELETE"),
  // For backward compatibility
  create: (expense: Omit<Expense, "id" | "_id">) => request("/expenses", "POST", expense)
};

export const debtAPI = {
  getAll: () => request("/debts", "GET") as Promise<Debt[]>,
  add: (debt: Omit<Debt, "id" | "_id">) => request("/debts", "POST", debt),
  update: (id: string, debt: Omit<Debt, "id" | "_id">) =>
    request(`/debts/${id}`, "PUT", debt),
  delete: (id: string) => request(`/debts/${id}`, "DELETE"),
};

export const summaryAPI = {
  getMonthSummary: (month: number, year: number) =>
    request(`/summary?month=${month}&year=${year}`, "GET") as Promise<Summary>,
  getTotalAssets: () => request("/summary/assets", "GET") as Promise<{ totalAssets: number; totalAllTimeIncome?: number; totalAllTimeExpense?: number; }>,
};

export const authAPI = {
  login: (data: any) => request("/auth/login", "POST", data),
  register: (data: any) => request("/auth/register", "POST", data),
  profile: () => request("/auth/profile", "GET"),
};
