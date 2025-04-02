
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, isAdmin, User, getAllUsers, banUser, addUser } from "@/lib/auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus, Trash, Search, Ban, RefreshCw } from "lucide-react";

const addUserFormSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  isAdmin: z.boolean().default(false)
});

type AddUserFormValues = z.infer<typeof addUserFormSchema>;

export default function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      email: "",
      name: "",
      isAdmin: false
    }
  });

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    if (!isAdmin()) {
      navigate("/dashboard");
      return;
    }
    
    loadUsers();
  }, [navigate]);

  const loadUsers = () => {
    setIsLoading(true);
    try {
      const allUsers = getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = (email: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${email}?`)) {
      const result = banUser(email);
      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
        });
        loadUsers();
      } else {
        toast({
          title: "Lỗi",
          description: result.message,
          variant: "destructive",
        });
      }
    }
  };

  const onSubmitAddUser = async (values: AddUserFormValues) => {
    setIsSubmitting(true);
    
    try {
      const result = addUser(values.email, values.name, values.isAdmin);
      
      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
        });
        form.reset();
        setIsAddDialogOpen(false);
        loadUsers();
      } else {
        toast({
          title: "Lỗi",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm người dùng",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản Lý Người Dùng</h1>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={loadUsers}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Thêm Người Dùng</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm người dùng mới</DialogTitle>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitAddUser)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Email người dùng" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Họ tên</FormLabel>
                              <FormControl>
                                <Input placeholder="Họ tên người dùng" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isAdmin"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Cấp quyền quản trị viên
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý
                              </>
                            ) : "Thêm người dùng"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo email, tên..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div role="status" className="flex justify-center items-center flex-col">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="mt-4 text-gray-500 dark:text-gray-400">Đang tải danh sách người dùng...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Đăng nhập gần nhất</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {searchQuery ? "Không tìm thấy người dùng phù hợp" : "Chưa có người dùng nào"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>
                              {user.isVerified ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                                  Đã xác minh
                                </span>
                              ) : (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                                  Chưa xác minh
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.isAdmin ? (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                  Quản trị viên
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                                  Người dùng
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>{formatDate(user.lastLogin)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleBanUser(user.email)}
                                disabled={user.isAdmin} // Prevent removing admins
                                className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
