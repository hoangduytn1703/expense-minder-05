
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { incomeAPI } from "@/lib/api";
import { formatNumberInput, parseFormattedNumber, incomeCategories } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AddIncomeDialogProps {
  month: number;
  year: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  categories?: typeof incomeCategories;
}

export default function AddIncomeDialog({ 
  month, 
  year, 
  open, 
  onOpenChange, 
  onSave,
  categories = incomeCategories
}: AddIncomeDialogProps) {
  const [category, setCategory] = useState(categories[0].id);
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const availableCategories = categories.filter(cat => cat.id !== 'previousMonth');

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const parsedAmount = parseFormattedNumber(amount);

      await incomeAPI.add({
        month,
        year,
        category,
        amount: parsedAmount,
        note,
      });

      toast({
        title: "Thành công",
        description: "Đã thêm khoản thu nhập mới",
      });

      // Reset form
      setCategory(categories[0].id);
      setAmount('0');
      setNote("");
      
      onSave();
      onOpenChange(false);
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
            Nhập thông tin cho khoản thu nhập mới
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="category" className="text-right">
              Danh mục
            </label>
            <div className="col-span-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            {isSaving ? "Đang thêm..." : "Thêm thu nhập"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
