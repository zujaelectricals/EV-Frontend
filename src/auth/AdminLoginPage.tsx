import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, Phone, Shield, Users
} from "lucide-react";
import { useNavigate, Navigate, Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCredentials, isUserAuthenticated } from "@/app/slices/authSlice";
import { loadBookingsForUser } from "@/app/slices/bookingSlice";
import { useSendAdminOTPMutation, useVerifyAdminOTPMutation } from "@/app/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const AdminLoginPage = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState("");
  const [loginOtpError, setLoginOtpError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [sendOTP, { isLoading: isSendingOTP }] = useSendAdminOTPMutation();
  const [verifyOTP, { isLoading: isVerifyingOTP }] = useVerifyAdminOTPMutation();

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/admin";

  // If already authenticated, redirect based on role
  if (isAuthenticated || isUserAuthenticated()) {
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === "staff") {
      return <Navigate to="/staff/leads" replace />;
    } else {
      // Regular users should use the normal login page
      return <Navigate to="/login" replace />;
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const identifier = loginMethod === 'mobile' ? mobile.trim().replace(/\D/g, '') : email.trim().toLowerCase();
    
    if (!identifier) {
      toast.error(`Please enter your ${loginMethod === 'mobile' ? 'mobile number' : 'email address'}`);
      return;
    }

    if (loginMethod === 'mobile' && identifier.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    if (loginMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const payload = {
        identifier,
        otp_type: loginMethod,
      };
      
      console.log('🔵 [ADMIN SEND OTP] Request Body:', JSON.stringify(payload, null, 2));
      const result = await sendOTP(payload).unwrap();
      console.log('🟢 [ADMIN SEND OTP] Response:', JSON.stringify(result, null, 2));
      setShowOTPInput(true);
      toast.success(result.message || 'OTP sent successfully');
    } catch (err: unknown) {
      console.log('🔴 [ADMIN SEND OTP] Error Response:', JSON.stringify(err, null, 2));
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (err && typeof err === 'object' && 'data' in err) {
        const error = err as { data?: { message?: string; detail?: string; error?: string } | string | string[] };
        // Handle array response (e.g., ["User does not have admin/staff privileges"])
        if (Array.isArray(error.data)) {
          errorMessage = error.data[0] || errorMessage;
        } else if (typeof error.data === 'string') {
          errorMessage = error.data;
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.data?.detail) {
          errorMessage = error.data.detail;
        } else if (error.data?.error) {
          errorMessage = error.data.error;
        }
      } else if (err && typeof err === 'object' && 'error' in err) {
        errorMessage = (err as { error: string }).error;
      }
      toast.error(errorMessage);
    }
  };

  const handleVerifyLoginOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const identifier = loginMethod === 'mobile' ? mobile.trim().replace(/\D/g, '') : email.trim().toLowerCase();
    
    if (!identifier) {
      toast.error('Please send OTP first');
      return;
    }

    if (!loginOtpCode || loginOtpCode.length !== 6) {
      setLoginOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoginOtpError("");

    try {
      const payload = {
        identifier,
        otp_code: loginOtpCode,
        otp_type: loginMethod,
      };

      console.log('🔵 [ADMIN VERIFY OTP] Request Body:', JSON.stringify(payload, null, 2));
      const result = await verifyOTP(payload).unwrap();
      console.log('🟢 [ADMIN VERIFY OTP] Response:', JSON.stringify(result, null, 2));

      // Check if user is admin or staff
      if (result.user.role !== "admin" && result.user.role !== "staff") {
        toast.error("Access denied. This login page is for administrators and staff only.");
        return;
      }

      // Convert API user to app User format
      const user = {
        id: result.user.id.toString(),
        name: result.user.username || result.user.email,
        email: result.user.email,
        role: result.user.role as 'admin' | 'staff' | 'user',
        isDistributor: result.user.is_distributor || false,
        phone: result.user.mobile,
        joinedAt: new Date().toISOString(),
      };

      dispatch(setCredentials({
        user,
        accessToken: result.tokens.access,
        refreshToken: result.tokens.refresh,
      }));

      dispatch(loadBookingsForUser(user.id));
      toast.success(`Welcome back, ${user.name || user.email}!`);

      // Redirect based on user role from API response
      const userRole = result.user.role?.toLowerCase();
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "staff") {
        navigate("/staff/leads", { replace: true });
      } else {
        // Fallback: should not happen for admin login, but redirect to regular login if it does
        toast.error("Access denied. This login page is for administrators and staff only.");
        navigate("/login", { replace: true });
      }
    } catch (err: unknown) {
      console.log('🔴 [ADMIN VERIFY OTP] Error Response:', JSON.stringify(err, null, 2));
      let errorMessage = 'Invalid OTP. Please try again.';
      if (err && typeof err === 'object' && 'data' in err) {
        const error = err as { data?: { message?: string; detail?: string; error?: string } | string | string[] };
        // Handle array response (e.g., ["User does not have admin/staff privileges"])
        if (Array.isArray(error.data)) {
          errorMessage = error.data[0] || errorMessage;
        } else if (typeof error.data === 'string') {
          errorMessage = error.data;
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.data?.detail) {
          errorMessage = error.data.detail;
        } else if (error.data?.error) {
          errorMessage = error.data.error;
        }
      } else if (err && typeof err === 'object' && 'error' in err) {
        errorMessage = (err as { error: string }).error;
      }
      setLoginOtpError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const imageVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
  };

  const formVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      <motion.div
        initial="initial"
        animate="animate"
        className="flex w-full"
      >
        {/* Left Column - Brand Section */}
        <motion.div
          variants={imageVariants}
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&h=1600&fit=crop&q=80)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90" />

          <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white w-full">
            <div className="absolute top-12 left-12 w-8 h-8 border-l-2 border-t-2 border-white/30" />
            <div className="absolute bottom-12 right-12 w-8 h-8 border-r-2 border-b-2 border-white/30" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-10 w-10 text-white/90" />
                <h1 className="text-5xl font-bold tracking-tight">
                  Admin Portal
                </h1>
              </div>
              <p className="text-xl text-white/80 max-w-md">
                Secure access for administrators and staff members
              </p>
              <div className="flex items-center gap-2 text-white/70 mt-8">
                <Users className="h-5 w-5" />
                <span className="text-sm">Restricted Access</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column - Login Form */}
        <motion.div
          variants={formVariants}
          className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-8 w-8 text-gray-900" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Admin Login
                </h2>
              </div>
              <p className="text-gray-600">
                Sign in with your administrator or staff credentials
              </p>
            </div>

            {!showOTPInput ? (
              <div className="space-y-5">
                {/* Login Method Selection Tabs */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={loginMethod === 'email' ? 'default' : 'outline'}
                    onClick={() => {
                      setLoginMethod('email');
                      setShowOTPInput(false);
                      setLoginOtpCode("");
                      setLoginOtpError("");
                    }}
                    className={`h-12 flex flex-col items-center justify-center gap-1 ${
                      loginMethod === 'email' 
                        ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-900'
                    } transition-all`}
                  >
                    <Mail className="h-5 w-5" />
                    <span className="text-sm font-medium">Email</span>
                  </Button>
                  <Button
                    type="button"
                    variant={loginMethod === 'mobile' ? 'default' : 'outline'}
                    onClick={() => {
                      setLoginMethod('mobile');
                      setShowOTPInput(false);
                      setLoginOtpCode("");
                      setLoginOtpError("");
                    }}
                    className={`h-12 flex flex-col items-center justify-center gap-1 ${
                      loginMethod === 'mobile' 
                        ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-900'
                    } transition-all`}
                  >
                    <Phone className="h-5 w-5" />
                    <span className="text-sm font-medium">Phone</span>
                  </Button>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-4">
                  {loginMethod === 'email' ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="yourname@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setShowOTPInput(false);
                          }}
                          className="pl-10 h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900 transition-all"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span>Use your registered email address</span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="tel"
                          placeholder="1234567890"
                          value={mobile}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                            setMobile(value);
                            setShowOTPInput(false);
                          }}
                          className="pl-10 h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900 transition-all"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span>Enter your registered mobile number</span>
                      </p>
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-lg hover:shadow-xl"
                    disabled={isSendingOTP || (loginMethod === 'email' ? !email.trim() : !mobile.trim())}
                  >
                    {isSendingOTP ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">
                    OTP sent to: <span className="font-medium text-gray-900">
                      {loginMethod === 'mobile' ? mobile : email}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOTPInput(false);
                      setLoginOtpCode("");
                      setLoginOtpError("");
                    }}
                    className="text-xs text-gray-600 hover:text-gray-900 underline"
                  >
                    Change {loginMethod === 'mobile' ? 'mobile number' : 'email'}
                  </button>
                </div>

                <form onSubmit={handleVerifyLoginOTP} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="adminLoginOtp" className="text-sm font-medium">Enter OTP *</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="adminLoginOtp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={loginOtpCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setLoginOtpCode(value);
                          if (loginOtpError) setLoginOtpError("");
                        }}
                        maxLength={6}
                        className={`pl-10 h-12 text-center text-2xl tracking-widest font-mono ${loginOtpError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                        autoFocus
                        required
                      />
                    </div>
                    {loginOtpError && <p className="text-xs text-red-500">{loginOtpError}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-lg hover:shadow-xl"
                    disabled={isVerifyingOTP || !loginOtpCode || loginOtpCode.length !== 6}
                  >
                    {isVerifyingOTP ? "Verifying..." : "Sign In"}
                  </Button>
                </form>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Not an admin or staff?{" "}
                <Link 
                  to="/login" 
                  className="text-gray-900 font-medium hover:underline transition-colors"
                >
                  Go to regular login
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

