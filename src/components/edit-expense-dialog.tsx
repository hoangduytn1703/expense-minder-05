
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
import { Expense, expenseAPI } from "@/lib/api";
import { formatNumberInput, parseFormattedNumber } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface EditExpenseDialogProps {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function EditExpenseDialog({ 
  expense, 
  open, 
  onOpenChange, 
  onSave 
}: EditExpenseDialogProps) {
  const [amount, setAmount] = useState(formatNumberInput(expense.amount.toString()));
  const [actualAmount, setActualAmount] = useState(
    expense.actualAmount ? formatNumberInput(expense.actualAmount.toString()) : ''
  );
  const [note, setNote] = useState(expense.note || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const parsedAmount = parseFormattedNumber(amount);
      const parsedActualAmount = actualAmount ? parseFormattedNumber(actualAmount) : undefined;
      const id = expense._id || expense.id;

      if (id) {
        // Update existing expense
        await expenseAPI.update(id, { 
          month: expense.month,
          year: expense.year,
          category: expense.category,
          scope: expense.scope,
          amount: parsedAmount, 
          actualAmount: parsedActualAmount,
          note 
        });
      } else {
        // Create new expense
        await expenseAPI.create({
          month: expense.month,
          year: expense.year,
          category: expense.category,
          scope: expense.scope,
          amount: parsedAmount,
          actualAmount: parsedActualAmount,
          note,
        });
      }

      toast({
        title: "Thành công",
        description: id ? "Đã cập nhật khoản chi tiêu" : "Đã tạo khoản chi tiêu mới",
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi khi lưu chi tiêu:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu khoản chi tiêu",
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
          <DialogTitle>Chỉnh sửa chi tiêu</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho khoản chi tiêu
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
              onChange={(e) => handleAmountChange(e.target.value, setAmount)}
              className="col-span-3"
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
