
import React, { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { expenseAPI } from "@/lib/api";
import { formatNumberInput, parseFormattedNumber, getExpenseCategories } from "@/lib/utils";
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
  onSave
}: AddExpenseDialogProps) {
  const [categories, setCategories] = useState(getExpenseCategories());
  const [category, setCategory] = useState(categories[0]?.id || "");
  const [amount, setAmount] = useState('0');
  const [actualAmount, setActualAmount] = useState('');
  const [note, setNote] = useState("");
  const [scope, setScope] = useState(categories[0]?.scope || "personal");
  const [isSaving, setIsSaving] = useState(false);

  // Load categories when dialog opens
  useEffect(() => {
    if (open) {
      const updatedCategories = getExpenseCategories();
      setCategories(updatedCategories);
      setCategory(updatedCategories[0]?.id || "");
      setScope(updatedCategories[0]?.scope || "personal");
    }
  }, [open]);

  // Update scope when category changes
  useEffect(() => {
    const selectedCategory = categories.find(cat => cat.id === category);
    if (selectedCategory) {
      setScope(selectedCategory.scope || "personal");
    }
  }, [category, categories]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const parsedAmount = parseFormattedNumber(amount);
      const parsedActualAmount = actualAmount ? parseFormattedNumber(actualAmount) : undefined;

      await expenseAPI.add({
        month,
        year,
        category,
        scope,
        amount: parsedAmount,
        actualAmount: parsedActualAmount,
        note,
      });

      toast({
        title: "Thành công",
        description: "Đã thêm khoản chi tiêu mới",
      });

      // Reset form
      setAmount('0');
      setActualAmount('');
      setNote("");
      
      onSave();
      onOpenChange(false);
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
            Nhập thông tin cho khoản chi tiêu mới
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
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="scope" className="text-right">
              Phạm vi
            </label>
            <Input
              id="scope"
              value={scope === "personal" ? "Cá nhân" : "Gia đình"}
              readOnly
              className="col-span-3 bg-gray-100"
            />
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
            {isSaving ? "Đang thêm..." : "Thêm chi tiêu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
