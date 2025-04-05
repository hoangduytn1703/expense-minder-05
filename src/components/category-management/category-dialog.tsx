
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseCategory, IncomeCategory } from "@/lib/api";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  category?: ExpenseCategory | IncomeCategory;
  type: "income" | "expense";
}

export default function CategoryDialog({
  open,
  onOpenChange,
  onSave,
  category,
  type
}: CategoryDialogProps) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"S" | "L" | "C" | "B" | "Đ">("S");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const isEditing = !!category;

  useEffect(() => {
    if (open && category) {
      setId(category.id);
      setName(category.name);
      if ("scope" in category) {
        setScope(category.scope);
      }
    } else if (open) {
      // Clear form for new category
      setId("");
      setName("");
      setScope("S");
    }
    setError("");
  }, [open, category]);

  const validateForm = () => {
    if (!id || !name) {
      setError("Vui lòng điền đầy đủ thông tin");
      return false;
    }
    
    // ID should only contain lowercase letters, numbers, and hyphens
    if (!/^[a-z0-9-]+$/.test(id)) {
      setError("ID chỉ được chứa chữ thường, số và dấu gạch ngang");
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      
      const apiModule = type === "expense" 
        ? (await import("@/lib/api")).expenseCategoryAPI 
        : (await import("@/lib/api")).incomeCategoryAPI;
      
      const data = type === "expense" 
        ? { id, name, scope } as ExpenseCategory
        : { id, name } as IncomeCategory;
      
      if (isEditing) {
        await apiModule.update(data);
      } else {
        await apiModule.create(data);
      }
      
      toast({
        title: "Thành công",
        description: isEditing ? "Đã cập nhật danh mục" : "Đã thêm danh mục mới",
      });
      
      onSave();
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Đã có lỗi xảy ra";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin danh mục"
              : "Điền thông tin cho danh mục mới"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="id" className="text-right">
              ID
            </label>
            <Input
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value.toLowerCase())}
              className="col-span-3"
              disabled={isEditing}
              placeholder="category-id"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Tên
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Tên danh mục"
            />
          </div>
          
          {type === "expense" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="scope" className="text-right">
                Phạm vi
              </label>
              <Select value={scope} onValueChange={(value) => setScope(value as any)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn phạm vi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">S - Sống</SelectItem>
                  <SelectItem value="L">L - Lẻ</SelectItem>
                  <SelectItem value="C">C - Cần</SelectItem>
                  <SelectItem value="B">B - Bổ sung</SelectItem>
                  <SelectItem value="Đ">Đ - Đầu tư</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
