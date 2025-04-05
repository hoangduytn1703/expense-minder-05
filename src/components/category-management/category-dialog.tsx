
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/utils";
import {
  ExpenseCategory,
  IncomeCategory,
  expenseCategoryAPI,
  incomeCategoryAPI,
} from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

interface IncomeCategory extends Category { }

interface ExpenseCategory extends Category {
  scope: string;
}

const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: "Tên danh mục phải có ít nhất 2 ký tự.",
  }),
  scope: z.string().optional(),
});

interface CategoryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: "add" | "edit";
  categoryType: "income" | "expense";
  category?: IncomeCategory | ExpenseCategory;
  onSuccess?: () => void;
}

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function CategoryDialog({
  open,
  setOpen,
  mode,
  categoryType,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      scope: (category as ExpenseCategory)?.scope || "S",
    },
  });

  const handleSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (categoryType === 'income') {
        // Handle income category
        const categoryData: IncomeCategory = {
          id: category?.id || generateId(),
          name: data.name,
        };
        
        if (mode === 'edit' && category) {
          await incomeCategoryAPI.update(categoryData.id, categoryData);
        } else {
          await incomeCategoryAPI.add(categoryData);
        }
      } else {
        // Handle expense category
        const categoryData: ExpenseCategory = {
          id: category?.id || generateId(),
          name: data.name,
          scope: data.scope || 'S', // Provide default if not available
        };
        
        if (mode === 'edit' && category) {
          await expenseCategoryAPI.update(categoryData.id, categoryData);
        } else {
          await expenseCategoryAPI.add(categoryData);
        }
      }
      
      onSuccess?.();
      form.reset();
      setOpen(false);
      toast({
        title: mode === 'add' ? "Đã thêm danh mục mới" : "Đã cập nhật danh mục",
        description: "Thay đổi đã được lưu thành công.",
      });
    } catch (error) {
      console.error("Error submitting category", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu danh mục. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Thêm danh mục" : "Chỉnh sửa danh mục"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Tạo một danh mục mới để quản lý thu nhập và chi tiêu của bạn."
              : "Chỉnh sửa thông tin danh mục hiện tại."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Ăn uống" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {categoryType === "expense" && (
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phạm vi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phạm vi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="S">Sinh hoạt</SelectItem>
                        <SelectItem value="L">Làm đẹp</SelectItem>
                        <SelectItem value="C">Con cái</SelectItem>
                        <SelectItem value="B">Bản thân</SelectItem>
                        <SelectItem value="Đ">Đầu tư</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Đang xử lý..."
                : mode === "add"
                  ? "Thêm"
                  : "Lưu"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
