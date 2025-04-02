import { useState, useContext } from "react";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { debtAPI, Debt } from "@/lib/api";
import { AssetsContext } from "@/contexts/AssetsContext";
import { formatNumberInput, parseFormattedNumber, formatCurrency } from "@/lib/utils";

interface AddDebtDialogProps {
  onUpdate: () => void;
}

export default function AddDebtDialog({ onUpdate }: AddDebtDialogProps) {
  const [name, setName] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [formattedTotalAmount, setFormattedTotalAmount] = useState("");
  const [months, setMonths] = useState(1);
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [note, setNote] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();

  const handleAmountChange = (value: string) => {
    const formatted = formatNumberInput(value);
    setFormattedTotalAmount(formatted);
    setTotalAmount(parseFormattedNumber(formatted));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || totalAmount <= 0 || months <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      await debtAPI.create({
        name,
        totalAmount,
        months,
        startMonth,
        startYear,
        note,
        monthlyPayment: calculateMonthlyPayment(totalAmount, months)
      });

      toast({
        title: "Thành công",
        description: "Đã thêm khoản nợ mới",
      });

      setName("");
      setTotalAmount(0);
      setFormattedTotalAmount("");
      setMonths(1);
      setStartMonth(new Date().getMonth() + 1);
      setStartYear(new Date().getFullYear());
      setNote("");
      setIsOpen(false);

      onUpdate();
    } catch (error) {
      console.error("Error adding debt:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm khoản nợ. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" /> Thêm khoản nợ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm khoản nợ mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin khoản nợ cần thêm vào hệ thống.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên khoản nợ"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalAmount" className="text-right">
                Tổng nợ
              </Label>
              <Input
                id="totalAmount"
                type="text"
                value={formattedTotalAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Tổng số tiền nợ"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="months" className="text-right">
                Số tháng
              </Label>
              <Input
                id="months"
                type="number"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                min="1"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Bắt đầu
              </Label>
              <div className="col-span-3 flex gap-2">
                <Select value={startMonth.toString()} onValueChange={(value) => setStartMonth(Number(value))}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Tháng" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={startYear.toString()} onValueChange={(value) => setStartYear(Number(value))}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Năm" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Ghi chú
              </Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú (không bắt buộc)"
                className="col-span-3"
              />
            </div>
            
            {totalAmount > 0 && months > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right text-sm text-gray-500">Trả hàng tháng</span>
                <div className="col-span-3">
                  <span className="font-medium text-green-600">
                    {formatCurrency(calculateMonthlyPayment(totalAmount, months))} đ
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="submit">Thêm khoản nợ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
