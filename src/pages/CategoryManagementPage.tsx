
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import {
  incomeCategories as defaultIncomeCategories,
  expenseCategories as defaultExpenseCategories,
  saveIncomeCategories,
  saveExpenseCategories,
  getIncomeCategories,
  getExpenseCategories
} from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  scope?: string;
}

export default function CategoryManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("income");
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    id: "",
    name: "",
    scope: "personal"
  });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const loadedIncomeCategories = getIncomeCategories();
    const loadedExpenseCategories = getExpenseCategories();
    
    setIncomeCategories(loadedIncomeCategories);
    setExpenseCategories(loadedExpenseCategories);
  };

  const handleAddCategory = () => {
    if (!newCategory.id.trim() || !newCategory.name.trim()) {
      toast({
        title: "Thông tin không hợp lệ",
        description: "Vui lòng điền đầy đủ thông tin danh mục",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate ID
    const categories = activeTab === "income" ? incomeCategories : expenseCategories;
    const isDuplicate = categories.some(cat => cat.id === newCategory.id);

    if (isDuplicate) {
      toast({
        title: "ID đã tồn tại",
        description: "Vui lòng chọn một ID khác",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "income") {
      const updatedCategories = [...incomeCategories, newCategory];
      setIncomeCategories(updatedCategories);
      saveIncomeCategories(updatedCategories);
    } else {
      const updatedCategories = [...expenseCategories, newCategory];
      setExpenseCategories(updatedCategories);
      saveExpenseCategories(updatedCategories);
    }

    toast({
      title: "Thành công",
      description: "Đã thêm danh mục mới",
    });

    setIsAddDialogOpen(false);
    setNewCategory({ id: "", name: "", scope: "personal" });
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditedName(category.name);
  };

  const saveEditedCategory = (categoryId: string) => {
    if (!editedName.trim()) {
      toast({
        title: "Tên không hợp lệ",
        description: "Tên danh mục không được để trống",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "income") {
      const updatedCategories = incomeCategories.map(cat => 
        cat.id === categoryId ? { ...cat, name: editedName } : cat
      );
      setIncomeCategories(updatedCategories);
      saveIncomeCategories(updatedCategories);
    } else {
      const updatedCategories = expenseCategories.map(cat => 
        cat.id === categoryId ? { ...cat, name: editedName } : cat
      );
      setExpenseCategories(updatedCategories);
      saveExpenseCategories(updatedCategories);
    }

    toast({
      title: "Thành công",
      description: "Đã cập nhật danh mục",
    });

    setEditingCategory(null);
  };

  const confirmDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const deleteCategory = () => {
    if (!categoryToDelete) return;

    // Check if it's a default category that shouldn't be deleted
    const isProtected = 
      (activeTab === "income" && categoryToDelete.id === "previousMonth") ||
      (activeTab === "expense" && ["groceries", "bills", "mortgage", "entertainment"].includes(categoryToDelete.id));

    if (isProtected) {
      toast({
        title: "Không thể xóa",
        description: "Đây là danh mục mặc định và không thể xóa",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      return;
    }

    if (activeTab === "income") {
      const updatedCategories = incomeCategories.filter(cat => cat.id !== categoryToDelete.id);
      setIncomeCategories(updatedCategories);
      saveIncomeCategories(updatedCategories);
    } else {
      const updatedCategories = expenseCategories.filter(cat => cat.id !== categoryToDelete.id);
      setExpenseCategories(updatedCategories);
      saveExpenseCategories(updatedCategories);
    }

    toast({
      title: "Thành công",
      description: "Đã xóa danh mục",
    });

    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const resetToDefault = () => {
    if (activeTab === "income") {
      setIncomeCategories(defaultIncomeCategories);
      saveIncomeCategories(defaultIncomeCategories);
    } else {
      setExpenseCategories(defaultExpenseCategories);
      saveExpenseCategories(defaultExpenseCategories);
    }

    toast({
      title: "Đã khôi phục",
      description: "Đã khôi phục các danh mục mặc định",
    });
  };

  const isDefaultCategory = (id: string, type: "income" | "expense") => {
    if (type === "income") {
      return id === "previousMonth" || defaultIncomeCategories.some(cat => cat.id === id);
    } else {
      return ["groceries", "bills", "mortgage", "entertainment"].includes(id) || 
        defaultExpenseCategories.some(cat => cat.id === id);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold dark:text-white">Quản lý danh mục</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-[400px] mb-6">
                <TabsTrigger value="income">Danh mục thu nhập</TabsTrigger>
                <TabsTrigger value="expense">Danh mục chi tiêu</TabsTrigger>
              </TabsList>

              <div className="flex justify-between mb-4">
                <Button 
                  onClick={() => setIsAddDialogOpen(true)} 
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" /> Thêm danh mục
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetToDefault}
                >
                  Khôi phục mặc định
                </Button>
              </div>

              <TabsContent value="income">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tên danh mục</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.id}</TableCell>
                          <TableCell>
                            {editingCategory === category.id ? (
                              <div className="flex space-x-2">
                                <Input
                                  value={editedName}
                                  onChange={(e) => setEditedName(e.target.value)}
                                  className="w-full"
                                />
                                <Button 
                                  size="sm" 
                                  onClick={() => saveEditedCategory(category.id)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              category.name
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingCategory !== category.id && (
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => startEditCategory(category)}
                                  disabled={category.id === "previousMonth"}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => confirmDeleteCategory(category)}
                                  disabled={category.id === "previousMonth"}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="expense">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tên danh mục</TableHead>
                        <TableHead>Phạm vi</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.id}</TableCell>
                          <TableCell>
                            {editingCategory === category.id ? (
                              <div className="flex space-x-2">
                                <Input
                                  value={editedName}
                                  onChange={(e) => setEditedName(e.target.value)}
                                  className="w-full"
                                />
                                <Button 
                                  size="sm" 
                                  onClick={() => saveEditedCategory(category.id)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              category.name
                            )}
                          </TableCell>
                          <TableCell>{category.scope === "personal" ? "Cá nhân" : "Gia đình"}</TableCell>
                          <TableCell className="text-right">
                            {editingCategory !== category.id && (
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => startEditCategory(category)}
                                  disabled={isDefaultCategory(category.id, "expense")}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => confirmDeleteCategory(category)}
                                  disabled={isDefaultCategory(category.id, "expense")}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin cho danh mục mới
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="id" className="text-right">
                ID
              </label>
              <Input
                id="id"
                value={newCategory.id}
                onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                placeholder="ID danh mục"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Tên
              </label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Tên danh mục"
                className="col-span-3"
              />
            </div>
            {activeTab === "expense" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="scope" className="text-right">
                  Phạm vi
                </label>
                <div className="col-span-3">
                  <Select 
                    value={newCategory.scope} 
                    onValueChange={(val) => setNewCategory({ ...newCategory, scope: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phạm vi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Cá nhân</SelectItem>
                      <SelectItem value="family">Gia đình</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleAddCategory}>
              Thêm danh mục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete?.name}"?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={deleteCategory}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
