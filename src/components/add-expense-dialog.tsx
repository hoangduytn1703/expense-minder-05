
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Expense, expenseAPI, ExpenseCategory, expenseCategoryAPI } from "@/lib/api";
import { formatNumberInput, parseFormattedNumber } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AddExpenseDialogProps {
  month: number;
  year: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function AddExpenseDialog({
  month,
  year,
  open,
  onOpenChange,
  onSave,
}: AddExpenseDialogProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [actualAmount, setActualAmount] = useState("");
  const [note, setNote] = useState("");
  const [scope, setScope] = useState<"S" | "L" | "C" | "B" | "Đ">("S");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Load categories when the dialog opens
  useEffect(() => {
    if (open) {
      const loadCategories = async () => {
        try {
          const cats = await expenseCategoryAPI.getAll();
          setCategories(cats);
          
          // Set default category if available
          if (cats.length > 0 && !category) {
            setCategory(cats[0].id);
            setScope(cats[0].scope);
          }
        } catch (error) {
          console.error("Error loading categories:", error);
        }
      };
      
      loadCategories();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setCategory("");
    setAmount("");
    setActualAmount("");
    setNote("");
    setScope("S");
    setError("");
  };

  const validateForm = () => {
    if (!category) {
      setError("Vui lòng chọn danh mục");
      return false;
    }

    if (!amount) {
      setError("Vui lòng nhập số tiền");
      return false;
    }

    return true;
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    
    // Update scope based on selected category
    const selectedCategory = categories.find(c => c.id === value);
    if (selectedCategory) {
      setScope(selectedCategory.scope);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const parsedAmount = parseFormattedNumber(amount);
      const parsedActualAmount = actualAmount
        ? parseFormattedNumber(actualAmount)
        : undefined;

      const expenseData: Expense = {
        category,
        month,
        year,
        amount: parsedAmount,
        actualAmount: parsedActualAmount,
        scope,
        note,
      };

      await expenseAPI.create(expenseData);

      toast({
        title: "Thành công",
        description: "Đã thêm khoản chi tiêu mới",
      });

      onSave();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Lỗi khi thêm chi tiêu:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm khoản chi tiêu",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAmountChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(formatNumberInput(value));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm khoản chi tiêu</DialogTitle>
          <DialogDescription>
            Thêm khoản chi tiêu mới cho tháng {month}/{year}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="category" className="text-right">
              Danh mục
            </label>
            <Select
              value={category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.scope})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="amount" className="text-right">
              Số tiền
            </label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value, setAmount)}
              className="col-span-3"
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="actualAmount" className="text-right">
              Thực tế
            </label>
            <Input
              id="actualAmount"
              value={actualAmount}
              onChange={(e) => handleAmountChange(e.target.value, setActualAmount)}
              className="col-span-3"
              placeholder="Số tiền thực tế (nếu có)"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="note" className="text-right">
              Ghi chú
            </label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="col-span-3"
              placeholder="Ghi chú (không bắt buộc)"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
