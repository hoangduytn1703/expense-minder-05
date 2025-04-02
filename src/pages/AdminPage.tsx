
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, isAdmin, getAllUsers, deleteUser, toggleUserBan, addUser } from "@/lib/auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Ban, CheckCircle, Trash, UserPlus, RefreshCw } from "lucide-react";

interface User {
  email: string;
  isAdmin: boolean;
  isVerified: boolean;
  isBanned: boolean;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  
  useEffect(() => {
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
    setLoading(true);
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
      setLoading(false);
    }
  };
  
  const handleAddUser = () => {
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }
    
    const success = addUser(newUserEmail, newUserPassword, newUserIsAdmin);
    if (success) {
      toast({
        title: "Thêm người dùng thành công",
        description: `Đã thêm ${newUserEmail} vào hệ thống`,
      });
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserIsAdmin(false);
      setAddDialogOpen(false);
      loadUsers();
    } else {
      toast({
        title: "Lỗi",
        description: "Email đã tồn tại trong hệ thống",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteUser = (email: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa người dùng ${email}?`)) {
      const success = deleteUser(email);
      if (success) {
        toast({
          title: "Xóa người dùng thành công",
          description: `Đã xóa ${email} khỏi hệ thống`,
        });
        loadUsers();
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể xóa người dùng",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleToggleBan = (email: string, isBanned: boolean) => {
    const action = isBanned ? "mở khóa" : "khóa";
    if (confirm(`Bạn có chắc chắn muốn ${action} người dùng ${email}?`)) {
      const success = toggleUserBan(email);
      if (success) {
        toast({
          title: `${isBanned ? "Mở khóa" : "Khóa"} người dùng thành công`,
          description: `Đã ${action} ${email}`,
        });
        loadUsers();
      } else {
        toast({
          title: "Lỗi",
          description: `Không thể ${action} người dùng`,
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold dark:text-white">Quản lý tài khoản</h1>
              <div className="flex gap-2">
                <Button onClick={loadUsers} variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Thêm người dùng
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm người dùng mới</DialogTitle>
                      <DialogDescription>
                        Nhập thông tin để tạo tài khoản mới cho người dùng.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@mail.com"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="********"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="admin"
                          checked={newUserIsAdmin}
                          onCheckedChange={(checked) => 
                            setNewUserIsAdmin(checked === true)
                          }
                        />
                        <Label htmlFor="admin">Là quản trị viên</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                        Hủy
                      </Button>
                      <Button onClick={handleAddUser}>
                        Thêm người dùng
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Email</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Quyền</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Không có người dùng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.email}>
                        <TableCell className="font-medium dark:text-white">{user.email}</TableCell>
                        <TableCell>
                          {user.isBanned ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Đã khóa
                            </span>
                          ) : user.isVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Đã xác thực
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Chưa xác thực
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              Quản trị viên
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Người dùng
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleBan(user.email, user.isBanned)}
                              disabled={user.isAdmin} // Không thể khóa admin
                              title={user.isBanned ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                            >
                              {user.isBanned ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.email)}
                              disabled={user.isAdmin} // Không thể xóa admin
                              title="Xóa tài khoản"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
