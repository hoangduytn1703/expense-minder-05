
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Định dạng số tiền thành chuỗi với dấu phân cách
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    useGrouping: true,
    maximumFractionDigits: 0
  }).format(amount);
}

// Hàm định dạng đầu vào số với dấu phân cách mỗi 3 chữ số
export function formatNumberInput(value: string): string {
  // Loại bỏ tất cả các ký tự không phải số
  const numbers = value.replace(/[^\d]/g, '');
  
  // Chuyển thành số
  const num = parseInt(numbers, 10);
  
  // Nếu giá trị trống hoặc không phải số, trả về chuỗi trống
  if (isNaN(num)) {
    return '';
  }
  
  // Định dạng số với dấu phân cách mỗi 3 chữ số
  return new Intl.NumberFormat('vi-VN').format(num);
}

// Chuyển đổi giá trị từ chuỗi định dạng sang số
export function parseFormattedNumber(value: string): number {
  // Loại bỏ tất cả các ký tự không phải số
  const numberStr = value.replace(/[^\d]/g, '');
  
  // Chuyển thành số
  const num = parseInt(numberStr, 10);
  
  // Nếu không phải số hợp lệ, trả về 0
  return isNaN(num) ? 0 : num;
}

// Danh sách các loại thu nhập - đưa previousMonth lên đầu
export const incomeCategories = [
  { id: "previousMonth", name: "Tiền còn tháng trước" },
  { id: "salary", name: "Lương cứng" },
  { id: "bonus", name: "Thưởng/OT" },  
  { id: "freelance", name: "Freelance" },
  { id: "debtCollection", name: "Thu nợ" },
  { id: "advance", name: "Tiền nhậu" },
  { id: "hui", name: "Hụi" },
  { id: "other", name: "Khác" }
];

// Danh sách các loại chi tiêu - sắp xếp theo thứ tự ưu tiên
export const expenseCategories = [
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

// Lấy tên loại thu nhập từ id
export const getIncomeCategoryName = (id: string): string => {
  const category = incomeCategories.find(cat => cat.id === id);
  return category ? category.name : id;
};

// Lấy tên loại chi tiêu từ id
export const getExpenseCategoryName = (id: string): string => {
  const category = expenseCategories.find(cat => cat.id === id);
  return category ? category.name : id;
};

// Lấy phạm vi của loại chi tiêu từ id
export const getExpenseCategoryScope = (id: string): string => {
  const category = expenseCategories.find(cat => cat.id === id);
  return category ? category.scope : "";
};

// Tạo mảng các tháng cho dropdown chọn tháng
export const getMonthOptions = (): { value: number; label: string }[] => {
  const options = [];
  for (let i = 1; i <= 12; i++) {
    options.push({ value: i, label: `Tháng ${i}` });
  }
  return options;
};

// Tạo mảng các năm cho dropdown chọn năm - chỉ giữ từ 2025-2028
export const getYearOptions = (): { value: number; label: string }[] => {
  const options = [];
  // Chỉ hiển thị các năm từ 2025 đến 2028
  for (let i = 2025; i <= 2028; i++) {
    options.push({ value: i, label: `${i}` });
  }
  return options;
};

// Tính số tiền phải trả hàng tháng cho một khoản nợ
export const calculateMonthlyPayment = (totalAmount: number, months: number): number => {
  if (months <= 0) return 0;
  return Math.ceil(totalAmount / months);
};

// Tính số dư còn lại
export const calculateRemaining = (totalIncome: number, totalExpense: number): number => {
  return totalIncome - totalExpense;
};
