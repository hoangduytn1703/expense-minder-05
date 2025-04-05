
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import CategoryDialog from "./category-dialog";
import { ExpenseCategory, IncomeCategory } from "@/lib/api";
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

interface CategoryTableProps {
  categories: (ExpenseCategory | IncomeCategory)[];
  type: "income" | "expense";
  onUpdate: () => void;
}

export default function CategoryTable({ categories, type, onUpdate }: CategoryTableProps) {
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | IncomeCategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ExpenseCategory | IncomeCategory | null>(null);

  const startEditing = (category: ExpenseCategory | IncomeCategory) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const startAdding = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const confirmDelete = (category: ExpenseCategory | IncomeCategory) => {
    // Check if it's a protected category
    if (type === "income" && category.id === "previousMonth") {
      toast({
        title: "Không thể xóa",
        description: "Không thể xóa danh mục mặc định của hệ thống",
        variant: "destructive",
      });
      return;
    }
    
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const deleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const apiModule = type === "expense" 
        ? (await import("@/lib/api")).expenseCategoryAPI 
        : (await import("@/lib/api")).incomeCategoryAPI;
      
      await apiModule.delete(categoryToDelete.id);
      
      toast({
        title: "Thành công",
        description: "Đã xóa danh mục",
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa danh mục",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {type === "expense" ? "Danh mục chi tiêu" : "Danh mục thu nhập"}
        </h2>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={startAdding}
        >
          <PlusCircle className="h-4 w-4" /> Thêm
        </Button>
      </div>

      <Table>
        <TableCaption>
          {type === "expense" ? "DANH MỤC CHI TIÊU" : "DANH MỤC THU NHẬP"}
        </TableCaption>
        <TableHeader className={type === "expense" ? "bg-red-100" : "bg-yellow-100"}>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tên</TableHead>
            {type === "expense" && <TableHead>Phạm vi</TableHead>}
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.id}</TableCell>
              <TableCell>{category.name}</TableCell>
              {type === "expense" && "scope" in category && (
                <TableCell>{category.scope}</TableCell>
              )}
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEditing(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => confirmDelete(category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={onUpdate}
        category={editingCategory || undefined}
        type={type}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa danh mục này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCategory} className="bg-red-500 hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
