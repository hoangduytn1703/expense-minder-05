
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export function formatNumberInput(value: string): string {
  // Remove non-numeric characters
  const numericValue = value.replace(/[^\d]/g, '');
  
  // Convert to number and format with thousand separators
  if (numericValue) {
    const number = parseInt(numericValue, 10);
    return new Intl.NumberFormat('vi-VN').format(number);
  }
  
  return '';
}

export function parseFormattedNumber(formattedValue: string): number {
  // Remove all non-numeric characters
  const numericString = formattedValue.replace(/[^\d]/g, '');
  
  // Convert to number
  return numericString ? parseInt(numericString, 10) : 0;
}

export interface Category {
  id: string;
  name: string;
  scope?: string;
}

// Default income categories
export const incomeCategories = [
  { id: 'salary', name: 'Lương' },
  { id: 'business', name: 'Kinh doanh' },
  { id: 'investment', name: 'Đầu tư' },
  { id: 'rental', name: 'Cho thuê' },
  { id: 'bonus', name: 'Thưởng' },
  { id: 'gift', name: 'Quà tặng' },
  { id: 'previousMonth', name: 'Số dư tháng trước' },
  { id: 'other', name: 'Khác' }
];

// Default expense categories
export const expenseCategories = [
  { id: 'groceries', name: 'Thực phẩm', scope: 'family' },
  { id: 'bills', name: 'Hóa đơn', scope: 'family' },
  { id: 'rent', name: 'Tiền nhà', scope: 'family' },
  { id: 'transportation', name: 'Di chuyển', scope: 'personal' },
  { id: 'entertainment', name: 'Giải trí', scope: 'personal' },
  { id: 'shopping', name: 'Mua sắm', scope: 'personal' },
  { id: 'healthcare', name: 'Sức khỏe', scope: 'personal' },
  { id: 'education', name: 'Giáo dục', scope: 'personal' },
  { id: 'travel', name: 'Du lịch', scope: 'personal' },
  { id: 'other', name: 'Khác', scope: 'personal' }
];

// Local storage keys
const INCOME_CATEGORIES_KEY = 'income_categories';
const EXPENSE_CATEGORIES_KEY = 'expense_categories';

// Save income categories to local storage
export function saveIncomeCategories(categories: Category[]) {
  localStorage.setItem(INCOME_CATEGORIES_KEY, JSON.stringify(categories));
}

// Save expense categories to local storage
export function saveExpenseCategories(categories: Category[]) {
  localStorage.setItem(EXPENSE_CATEGORIES_KEY, JSON.stringify(categories));
}

// Get income categories from local storage or default
export function getIncomeCategories(): Category[] {
  const stored = localStorage.getItem(INCOME_CATEGORIES_KEY);
  
  if (!stored) {
    return [...incomeCategories];
  }
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing income categories from localStorage:', error);
    return [...incomeCategories];
  }
}

// Get expense categories from local storage or default
export function getExpenseCategories(): Category[] {
  const stored = localStorage.getItem(EXPENSE_CATEGORIES_KEY);
  
  if (!stored) {
    return [...expenseCategories];
  }
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing expense categories from localStorage:', error);
    return [...expenseCategories];
  }
}

// Helper function to get category name by id
export function getCategoryName(id: string, type: 'income' | 'expense'): string {
  const categories = type === 'income' ? getIncomeCategories() : getExpenseCategories();
  const category = categories.find(cat => cat.id === id);
  return category ? category.name : id;
}

// Helper function to get income category name by id
export function getIncomeCategoryName(id: string): string {
  return getCategoryName(id, 'income');
}

// Helper function to get expense category name by id
export function getExpenseCategoryName(id: string): string {
  return getCategoryName(id, 'expense');
}

// Generate month options for select inputs
export function getMonthOptions() {
  return [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];
}

// Generate year options for select inputs
export function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  // From 2025 to 2125 as specified
  for (let year = 2025; year <= 2125; year++) {
    years.push({ value: year, label: `Năm ${year}` });
  }
  
  return years;
}

// Calculate monthly payment for debt
export function calculateMonthlyPayment(totalAmount: number, months: number): number {
  if (months <= 0) return 0;
  return Math.round(totalAmount / months);
}
