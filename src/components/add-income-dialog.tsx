
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
import { Income, incomeAPI, IncomeCategory, incomeCategoryAPI } from "@/lib/api";
import { formatNumberInput, parseFormattedNumber } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AddIncomeDialogProps {
  month: number;
  year: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function AddIncomeDialog({
  month,
  year,
  open,
  onOpenChange,
  onSave,
}: AddIncomeDialogProps) {
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Load categories when the dialog opens
  useEffect(() => {
    if (open) {
      const loadCategories = async () => {
        try {
          const cats = await incomeCategoryAPI.getAll();
          const filteredCats = cats.filter(c => c.id !== 'previousMonth'); // Hide 'previousMonth' from selection
          setCategories(filteredCats);
          
          // Set default category if available
          if (filteredCats.length > 0 && !category) {
            setCategory(filteredCats[0].id);
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
    setNote("");
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

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const parsedAmount = parseFormattedNumber(amount);

      const incomeData: Income = {
        category,
        month,
        year,
        amount: parsedAmount,
        note,
      };

      await incomeAPI.create(incomeData);

      toast({
        title: "Thành công",
        description: "Đã thêm khoản thu nhập mới",
      });

      onSave();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Lỗi khi thêm thu nhập:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm khoản thu nhập",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(formatNumberInput(value));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm khoản thu nhập</DialogTitle>
          <DialogDescription>
            Thêm khoản thu nhập mới cho tháng {month}/{year}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="category" className="text-right">
              Danh mục
            </label>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
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
              onChange={(e) => handleAmountChange(e.target.value)}
              className="col-span-3"
              placeholder="0"
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
