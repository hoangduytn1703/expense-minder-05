
import React, { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Debt, debtAPI } from "@/lib/api";
import { formatCurrency, calculateMonthlyPayment, getMonthOptions, getYearOptions } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface DebtManagementProps {
  onUpdate: () => void;
}

export default function DebtManagement({ onUpdate }: DebtManagementProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields for new debt
  const [name, setName] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [months, setMonths] = useState(1);
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [note, setNote] = useState("");
  
  // Form fields for editing
  const [editName, setEditName] = useState("");
  const [editTotalAmount, setEditTotalAmount] = useState(0);
  const [editMonths, setEditMonths] = useState(1);
  const [editStartMonth, setEditStartMonth] = useState(1);
  const [editStartYear, setEditStartYear] = useState(new Date().getFullYear());
  const [editNote, setEditNote] = useState("");

  // Month and year options
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();
  
  // Fetch all debts
  const fetchDebts = async () => {
    try {
      setLoading(true);
      const data = await debtAPI.getAll();
      
      // Calculate monthly payment for each debt
      const debtWithPayments = data.map(debt => ({
        ...debt,
        monthlyPayment: calculateMonthlyPayment(debt.totalAmount, debt.months)
      }));
      
      setDebts(debtWithPayments);
    } catch (error) {
      console.error("Error fetching debts:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu nợ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load debts on component mount
  useEffect(() => {
    fetchDebts();
  }, []);
  
  // Create a new debt
  const addDebt = async () => {
    try {
      if (!name || totalAmount <= 0 || months <= 0) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin",
          variant: "destructive",
        });
        return;
      }
      
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
      
      // Reset form
      setIsAdding(false);
      setName("");
      setTotalAmount(0);
      setMonths(1);
      setStartMonth(new Date().getMonth() + 1);
      setStartYear(new Date().getFullYear());
      setNote("");
      
      // Reload data
      fetchDebts();
      onUpdate();
    } catch (error) {
      console.error("Error adding debt:", error);
    }
  };
  
  // Start editing a debt
  const startEditing = (debt: Debt) => {
    setEditingId(debt.id || null);
    setEditName(debt.name);
    setEditTotalAmount(debt.totalAmount);
    setEditMonths(debt.months);
    setEditStartMonth(debt.startMonth);
    setEditStartYear(debt.startYear);
    setEditNote(debt.note || "");
  };
  
  // Save debt edits
  const saveEdit = async (id: string) => {
    try {
      if (!editName || editTotalAmount <= 0 || editMonths <= 0) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin",
          variant: "destructive",
        });
        return;
      }
      
      await debtAPI.update(id, {
        name: editName,
        totalAmount: editTotalAmount,
        months: editMonths,
        startMonth: editStartMonth,
        startYear: editStartYear,
        note: editNote,
        monthlyPayment: calculateMonthlyPayment(editTotalAmount, editMonths)
      });
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật khoản nợ",
      });
      
      setEditingId(null);
      fetchDebts();
      onUpdate();
    } catch (error) {
      console.error("Error updating debt:", error);
    }
  };
  
  // Delete a debt
  const deleteDebt = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa khoản nợ này không?")) {
      try {
        await debtAPI.delete(id);
        
        toast({
          title: "Thành công",
          description: "Đã xóa khoản nợ",
        });
        
        fetchDebts();
        onUpdate();
      } catch (error) {
        console.error("Error deleting debt:", error);
      }
    }
  };
  
  // Format month and year for display
  const formatMonthYear = (month: number, year: number) => {
    return `Tháng ${month}/${year}`;
  };
  
  return (
    <Card className="mt-8">
      <CardHeader className="bg-orange-100">
        <CardTitle>Quản lý nợ</CardTitle>
        <CardDescription>
          Theo dõi các khoản nợ và tự động tính toán khoản trả hàng tháng
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableCaption>Danh sách các khoản nợ</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Tổng nợ</TableHead>
              <TableHead>Số tháng</TableHead>
              <TableHead>Tháng bắt đầu</TableHead>
              <TableHead>Trả hàng tháng</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : debts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Chưa có khoản nợ nào
                </TableCell>
              </TableRow>
            ) : (
              debts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell>
                    {editingId === debt.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      debt.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === debt.id ? (
                      <Input
                        type="number"
                        value={editTotalAmount}
                        onChange={(e) => setEditTotalAmount(Number(e.target.value))}
                        className="w-28"
                      />
                    ) : (
                      `${formatCurrency(debt.totalAmount)} đ`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === debt.id ? (
                      <Input
                        type="number"
                        value={editMonths}
                        onChange={(e) => setEditMonths(Number(e.target.value))}
                        className="w-16"
                        min="1"
                      />
                    ) : (
                      debt.months
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === debt.id ? (
                      <div className="flex space-x-2">
                        <select
                          className="w-24 border rounded p-2"
                          value={editStartMonth}
                          onChange={(e) => setEditStartMonth(Number(e.target.value))}
                        >
                          {monthOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className="w-20 border rounded p-2"
                          value={editStartYear}
                          onChange={(e) => setEditStartYear(Number(e.target.value))}
                        >
                          {yearOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      formatMonthYear(debt.startMonth, debt.startYear)
                    )}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(debt.monthlyPayment || 0)} đ
                  </TableCell>
                  <TableCell>
                    {editingId === debt.id ? (
                      <Input
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                      />
                    ) : (
                      debt.note || ""
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === debt.id ? (
                      <Button size="sm" onClick={() => saveEdit(debt.id!)}>
                        Lưu
                      </Button>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEditing(debt)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteDebt(debt.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
            
            {isAdding && (
              <TableRow>
                <TableCell>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tên khoản nợ"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    placeholder="Tổng nợ"
                    className="w-28"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    placeholder="Số tháng"
                    className="w-16"
                    min="1"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <select
                      className="w-24 border rounded p-2"
                      value={startMonth}
                      onChange={(e) => setStartMonth(Number(e.target.value))}
                    >
                      {monthOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-20 border rounded p-2"
                      value={startYear}
                      onChange={(e) => setStartYear(Number(e.target.value))}
                    >
                      {yearOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </TableCell>
                <TableCell>
                  {totalAmount > 0 && months > 0
                    ? `${formatCurrency(calculateMonthlyPayment(totalAmount, months))} đ`
                    : ""}
                </TableCell>
                <TableCell>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" onClick={addDebt}>
                      Lưu
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                      Hủy
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {!isAdding && (
          <Button
            variant="outline"
            className="mt-4 flex items-center gap-2"
            onClick={() => setIsAdding(true)}
          >
            <PlusCircle className="h-4 w-4" /> Thêm khoản nợ
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
