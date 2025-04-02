
import { getCurrentUserId } from './auth';

// Interfaces
export interface Income {
  id?: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  note: string;
}

export interface Expense {
  id?: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  note: string;
  scope: string;
}

export interface Debt {
  id: string;
  name: string;
  amount: number;
  interestRate?: number;
  startDate: string;
  endDate?: string;
  note?: string;
  isPaid: boolean;
}

// Helper function for API simulation
const fetchAPI = async (endpoint: string, method: string = 'GET', data?: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // LocalStorage keys with user ID for data separation
    const storageKeys = {
      incomes: `incomes_${userId}`,
      expenses: `expenses_${userId}`,
      debts: `debts_${userId}`,
    };
    
    if (endpoint.includes('/incomes')) {
      return handleIncomes(endpoint, method, data, storageKeys.incomes);
    } else if (endpoint.includes('/expenses')) {
      return handleExpenses(endpoint, method, data, storageKeys.expenses);
    } else if (endpoint.includes('/debts')) {
      return handleDebts(endpoint, method, data, storageKeys.debts);
    } else if (endpoint.includes('/summary')) {
      return handleSummary(endpoint, storageKeys);
    }
    
    throw new Error('Invalid endpoint');
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Handle income data
const handleIncomes = (endpoint: string, method: string, data: any, storageKey: string) => {
  // Get existing data or initialize empty array
  const incomes: Income[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  if (method === 'GET') {
    // Parse URL parameters
    const url = new URL('http://dummy.com' + endpoint);
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');
    
    if (month && year) {
      return incomes.filter(income => 
        income.month === Number(month) && income.year === Number(year)
      );
    }
    return incomes;
  }
  
  if (method === 'POST') {
    const id = `income_${Date.now()}`;
    const newIncome = { ...data, id };
    incomes.push(newIncome);
    localStorage.setItem(storageKey, JSON.stringify(incomes));
    return newIncome;
  }
  
  if (method === 'PUT') {
    const updatedIncomes = incomes.map(income => 
      income.category === data.category &&
      income.month === data.month &&
      income.year === data.year ? data : income
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedIncomes));
    return data;
  }
  
  if (method === 'DELETE') {
    const filteredIncomes = incomes.filter(income => income.id !== data.id);
    localStorage.setItem(storageKey, JSON.stringify(filteredIncomes));
    return { success: true };
  }
};

// Handle expense data
const handleExpenses = (endpoint: string, method: string, data: any, storageKey: string) => {
  const expenses: Expense[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  if (method === 'GET') {
    const url = new URL('http://dummy.com' + endpoint);
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');
    
    if (month && year) {
      return expenses.filter(expense => 
        expense.month === Number(month) && expense.year === Number(year)
      );
    }
    return expenses;
  }
  
  if (method === 'POST') {
    const id = `expense_${Date.now()}`;
    const newExpense = { ...data, id };
    expenses.push(newExpense);
    localStorage.setItem(storageKey, JSON.stringify(expenses));
    return newExpense;
  }
  
  if (method === 'PUT') {
    const updatedExpenses = expenses.map(expense => 
      expense.category === data.category &&
      expense.month === data.month &&
      expense.year === data.year ? data : expense
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedExpenses));
    return data;
  }
  
  if (method === 'DELETE') {
    const filteredExpenses = expenses.filter(expense => expense.id !== data.id);
    localStorage.setItem(storageKey, JSON.stringify(filteredExpenses));
    return { success: true };
  }
};

// Handle debt data
const handleDebts = (endpoint: string, method: string, data: any, storageKey: string) => {
  const debts: Debt[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  if (method === 'GET') {
    return debts;
  }
  
  if (method === 'POST') {
    const id = `debt_${Date.now()}`;
    const newDebt = { ...data, id };
    debts.push(newDebt);
    localStorage.setItem(storageKey, JSON.stringify(debts));
    return newDebt;
  }
  
  if (method === 'PUT') {
    const updatedDebts = debts.map(debt => debt.id === data.id ? data : debt);
    localStorage.setItem(storageKey, JSON.stringify(updatedDebts));
    return data;
  }
  
  if (method === 'DELETE') {
    const filteredDebts = debts.filter(debt => debt.id !== data);
    localStorage.setItem(storageKey, JSON.stringify(filteredDebts));
    return { success: true };
  }
};

// Handle summary data
const handleSummary = (endpoint: string, storageKeys: Record<string, string>) => {
  const incomes: Income[] = JSON.parse(localStorage.getItem(storageKeys.incomes) || '[]');
  const expenses: Expense[] = JSON.parse(localStorage.getItem(storageKeys.expenses) || '[]');
  const debts: Debt[] = JSON.parse(localStorage.getItem(storageKeys.debts) || '[]');
  
  if (endpoint.includes('/total-assets')) {
    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalDebt = debts
      .filter(debt => !debt.isPaid)
      .reduce((sum, debt) => sum + debt.amount, 0);
    
    return {
      totalAssets: totalIncome - totalExpense - totalDebt,
      totalAllTimeIncome: totalIncome,
      totalAllTimeExpense: totalExpense,
      totalDebts: totalDebt
    };
  }
  
  // Month summary
  const url = new URL('http://dummy.com' + endpoint);
  const month = Number(url.searchParams.get('month'));
  const year = Number(url.searchParams.get('year'));
  
  const monthIncomes = incomes.filter(income => 
    income.month === month && income.year === year
  );
  const monthExpenses = expenses.filter(expense => 
    expense.month === month && expense.year === year
  );
  
  // Calculate previous month remaining (savings)
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  
  const prevMonthIncomes = incomes.filter(income => 
    income.month === prevMonth && income.year === prevYear
  );
  
  const prevMonthExpenses = expenses.filter(expense => 
    expense.month === prevMonth && expense.year === prevYear
  );
  
  const prevMonthIncome = prevMonthIncomes.reduce((sum, item) => sum + item.amount, 0);
  const prevMonthExpense = prevMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
  const previousMonthRemaining = prevMonthIncome - prevMonthExpense;
  
  const totalIncome = monthIncomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = monthExpenses.reduce((sum, item) => sum + item.amount, 0);
  
  return {
    totalIncome,
    totalExpense,
    remaining: totalIncome - totalExpense,
    previousMonthRemaining: previousMonthRemaining > 0 ? previousMonthRemaining : 0
  };
};

// Income API
export const incomeAPI = {
  getAll: async () => fetchAPI('/api/incomes'),
  getByMonth: async (month: number, year: number) => 
    fetchAPI(`/api/incomes?month=${month}&year=${year}`),
  add: async (data: Income) => fetchAPI('/api/incomes', 'POST', data),
  update: async (data: Income) => fetchAPI('/api/incomes', 'PUT', data),
  delete: async (id: string) => fetchAPI('/api/incomes', 'DELETE', { id })
};

// Expense API
export const expenseAPI = {
  getAll: async () => fetchAPI('/api/expenses'),
  getByMonth: async (month: number, year: number) => 
    fetchAPI(`/api/expenses?month=${month}&year=${year}`),
  add: async (data: Expense) => fetchAPI('/api/expenses', 'POST', data),
  update: async (data: Expense) => fetchAPI('/api/expenses', 'PUT', data),
  delete: async (id: string) => fetchAPI('/api/expenses', 'DELETE', { id })
};

// Debt API
export const debtAPI = {
  getAll: async () => fetchAPI('/api/debts'),
  add: async (data: Debt) => fetchAPI('/api/debts', 'POST', data),
  update: async (data: Debt) => fetchAPI('/api/debts', 'PUT', data),
  delete: async (id: string) => fetchAPI('/api/debts', 'DELETE', id),
  togglePaid: async (debt: Debt) => {
    const updatedDebt = { ...debt, isPaid: !debt.isPaid };
    return fetchAPI('/api/debts', 'PUT', updatedDebt);
  }
};

// Summary API
export const summaryAPI = {
  getMonthSummary: async (month: number, year: number) => 
    fetchAPI(`/api/summary/month?month=${month}&year=${year}`),
  getTotalAssets: async () => fetchAPI('/api/summary/total-assets')
};
