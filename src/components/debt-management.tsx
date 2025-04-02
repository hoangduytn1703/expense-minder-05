
import React, { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Debt, debtAPI } from "@/lib/api";
import { formatCurrency, calculateMonthlyPayment, getMonthOptions, getYearOptions, formatNumberInput, parseFormattedNumber } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface DebtManagementProps {
  onUpdate: () => void;
}

export default function DebtManagement({ onUpdate }: DebtManagementProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<Debt | null>(null);
  
  // Form fields for editing
  const [editName, setEditName] = useState("");
  const [editTotalAmount, setEditTotalAmount] = useState(0);
  const [editFormattedTotalAmount, setEditFormattedTotalAmount] = useState("");
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

  // Handle edit amount input change with formatting
  const handleEditAmountChange = (value: string) => {
    const formatted = formatNumberInput(value);
    setEditFormattedTotalAmount(formatted);
    setEditTotalAmount(parseFormattedNumber(formatted));
  };
  
  // Start editing a debt
  const startEditing = (debt: Debt) => {
    setEditingId(debt._id || debt.id || null);
    setEditName(debt.name);
    setEditTotalAmount(debt.totalAmount);
    setEditFormattedTotalAmount(formatNumberInput(debt.totalAmount.toString()));
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
  
  // Prepare to delete a debt
  const confirmDeleteDebt = (debt: Debt) => {
    setDebtToDelete(debt);
    setDeleteDialogOpen(true);
  };
  
  // Delete a debt
  const deleteDebt = async () => {
    if (!debtToDelete) return;
    
    const id = debtToDelete._id || debtToDelete.id;
    if (!id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy ID của khoản nợ",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await debtAPI.delete(id);
      
      toast({
        title: "Thành công",
        description: "Đã xóa khoản nợ",
      });
      
      setDeleteDialogOpen(false);
      setDebtToDelete(null);
      fetchDebts();
      onUpdate();
    } catch (error) {
      console.error("Error deleting debt:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa khoản nợ. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };
  
  // Format month and year for display
  const formatMonthYear = (month: number, year: number) => {
    return `Tháng ${month}/${year}`;
  };
  
  return (
    <Card>
      <CardHeader className="bg-orange-100 dark:bg-orange-900/20">
        <CardTitle>Danh sách khoản nợ</CardTitle>
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
                <TableRow key={debt._id || debt.id}>
                  <TableCell>
                    {editingId === (debt._id || debt.id) ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      debt.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === (debt._id || debt.id) ? (
                      <Input
                        type="text"
                        value={editFormattedTotalAmount}
                        onChange={(e) => handleEditAmountChange(e.target.value)}
                        className="w-28"
                      />
                    ) : (
                      `${formatCurrency(debt.totalAmount)} đ`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === (debt._id || debt.id) ? (
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
                    {editingId === (debt._id || debt.id) ? (
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
                    {editingId === (debt._id || debt.id) ? (
                      <Input
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                      />
                    ) : (
                      debt.note || ""
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === (debt._id || debt.id) ? (
                      <Button size="sm" onClick={() => saveEdit(editingId)}>
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
                          onClick={() => confirmDeleteDebt(debt)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn xóa khoản nợ này không? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={deleteDebt} className="bg-red-500 hover:bg-red-600">
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
