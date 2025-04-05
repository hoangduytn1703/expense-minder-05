
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
import { useToast } from "@/hooks/use-toast";

interface AddIncomeDialogProps {
  month: number;
  year: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  categories?: IncomeCategory[];
  onSuccess?: () => void;
}

export default function AddIncomeDialog({
  month,
  year,
  open,
  onOpenChange,
  onSave,
  categories: providedCategories,
  onSuccess,
}: AddIncomeDialogProps) {
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Load categories when the dialog opens
  useEffect(() => {
    if (open) {
      const loadCategories = async () => {
        try {
          if (providedCategories && providedCategories.length > 0) {
            const filteredCats = providedCategories.filter(c => c.id !== 'previousMonth');
            setCategories(filteredCats);
            
            if (filteredCats.length > 0 && !categoryId) {
              setCategoryId(filteredCats[0].id);
            }
          } else {
            const cats = await incomeCategoryAPI.getAll();
            const filteredCats = cats.filter(c => c.id !== 'previousMonth');
            setCategories(filteredCats);
            
            if (filteredCats.length > 0 && !categoryId) {
              setCategoryId(filteredCats[0].id);
            }
          }
        } catch (error) {
          console.error("Error loading categories:", error);
        }
      };
      
      loadCategories();
      resetForm();
    }
  }, [open, providedCategories, categoryId]);

  const resetForm = () => {
    setCategoryId("");
    setAmount("");
    setNote("");
    setError("");
  };

  const validateForm = () => {
    if (!categoryId) {
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

      const incomeData: Omit<Income, "id"> = {
        categoryId,
        month,
        year,
        amount: parsedAmount,
        note,
      };

      await incomeAPI.add(incomeData);

      toast({
        title: "Thành công",
        description: "Đã thêm khoản thu nhập mới",
      });

      if (onSuccess) {
        onSuccess();
      }
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
            <label htmlFor="categoryId" className="text-right">
              Danh mục
            </label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
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
