
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Income, incomeAPI } from "@/lib/api";
import { formatNumberInput, parseFormattedNumber } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface EditIncomeDialogProps {
  income: Income;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function EditIncomeDialog({ 
  income, 
  open, 
  onOpenChange, 
  onSave 
}: EditIncomeDialogProps) {
  const [amount, setAmount] = useState(formatNumberInput(income.amount.toString()));
  const [note, setNote] = useState(income.note || "");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when income changes
  React.useEffect(() => {
    if (open) {
      setAmount(formatNumberInput(income.amount.toString()));
      setNote(income.note || "");
    }
  }, [income, open]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const parsedAmount = parseFormattedNumber(amount);
      const id = income._id || income.id;

      if (id) {
        // Update existing income
        await incomeAPI.update(id, { amount: parsedAmount, note });
      } else {
        // Create new income
        await incomeAPI.create({
          month: income.month,
          year: income.year,
          category: income.category,
          amount: parsedAmount,
          note,
        });
      }

      toast({
        title: "Thành công",
        description: id ? "Đã cập nhật khoản thu nhập" : "Đã tạo khoản thu nhập mới",
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi khi lưu thu nhập:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu khoản thu nhập",
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
          <DialogTitle>Chỉnh sửa thu nhập</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho khoản thu nhập
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="amount" className="text-right">
              Số tiền
            </label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="col-span-3"
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
