
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyEmail, resendVerification } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [email, setEmail] = useState<string>("");

  const token = new URLSearchParams(location.search).get("token");
  
  // Check token on mount
  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setVerificationResult({
        success: false,
        message: "Token không hợp lệ. Vui lòng kiểm tra email của bạn."
      });
      return;
    }

    // Extract email from query params (for resend functionality)
    const urlEmail = new URLSearchParams(location.search).get("email");
    if (urlEmail) {
      setEmail(urlEmail);
    }

    const result = verifyEmail(token);
    setVerificationResult(result);
    setIsVerifying(false);
  }, [token, location.search]);

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy địa chỉ email",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const result = resendVerification(email);
      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
        });
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
        description: "Không thể gửi lại email xác minh",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Xác minh Email</h1>
          
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Đang xác minh email...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              {verificationResult?.success ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
              
              <p className="mt-4 text-xl text-gray-800 dark:text-gray-200 font-medium">
                {verificationResult?.success ? "Xác minh thành công!" : "Xác minh thất bại"}
              </p>
              
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {verificationResult?.message}
              </p>
              
              <div className="mt-8 space-y-4 w-full">
                {verificationResult?.success ? (
                  <Button 
                    className="w-full" 
                    onClick={() => navigate("/login")}
                  >
                    Đi đến đăng nhập
                  </Button>
                ) : (
                  <>
                    {email && (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={handleResendVerification}
                        disabled={isResending}
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Gửi lại email xác minh
                          </>
                        )}
                      </Button>
                    )}
                    <Button 
                      className="w-full" 
                      onClick={() => navigate("/register")}
                    >
                      Đăng ký tài khoản mới
                    </Button>
                  </>
                )}
                
                <Button 
                  className="w-full" 
                  variant="ghost"
                  onClick={() => navigate("/login")}
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
