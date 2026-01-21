import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, Eye, EyeOff, User, Calendar, Phone,
  ArrowLeft, Sparkles, MapPin, Building, Hash, Shield
} from "lucide-react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCredentials, isUserAuthenticated } from "@/app/slices/authSlice";
import { clearNonAuthStorage, updateAuthTokens } from "@/app/api/baseApi";
import { loadBookingsForUser } from "@/app/slices/bookingSlice";
import { useSignupMutation, useVerifySignupOTPMutation, useSendOTPMutation, useVerifyOTPMutation } from "@/app/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface SignupFormData {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  gender: string;
  date_of_birth: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}


export const LoginPage = () => {
  const [isSignupMode, setIsSignupMode] = useState(false);
  
  // Login state
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState("");
  const [loginOtpError, setLoginOtpError] = useState("");
  
  // Signup state
  const [signupData, setSignupData] = useState<SignupFormData>({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    gender: '',
    date_of_birth: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  
  // OTP verification state
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [signup, { isLoading: isSigningUp }] = useSignupMutation();
  const [verifySignupOTP, { isLoading: isVerifyingSignupOTP }] = useVerifySignupOTPMutation();
  const [sendOTP, { isLoading: isSendingOTP }] = useSendOTPMutation();
  const [verifyOTP, { isLoading: isVerifyingOTP }] = useVerifyOTPMutation();

  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  if (isAuthenticated || isUserAuthenticated()) {
    let redirectPath = "/";

    if (user?.role === "admin") {
      redirectPath = "/admin";
    } else if (user?.role === "staff") {
      redirectPath = "/staff/leads";
    } else if (user?.isDistributor) {
      redirectPath = "/distributor";
    } else {
      // Regular user - always redirect to homepage
      redirectPath = "/";
    }

    return <Navigate to={redirectPath} replace />;
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
      
      console.log('🔵 [SEND OTP] Request Body:', JSON.stringify(payload, null, 2));
      const result = await sendOTP(payload).unwrap();
      console.log('🟢 [SEND OTP] Response:', JSON.stringify(result, null, 2));
      setShowOTPInput(true);
      toast.success(result.message || 'OTP sent successfully');
    } catch (err: unknown) {
      console.log('🔴 [SEND OTP] Error Response:', JSON.stringify(err, null, 2));
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

      console.log('🔵 [VERIFY LOGIN OTP] Request Body:', JSON.stringify(payload, null, 2));
      const result = await verifyOTP(payload).unwrap();
      console.log('🟢 [VERIFY LOGIN OTP] Response:', JSON.stringify(result, null, 2));

      // Validate tokens exist in response
      if (!result.tokens || !result.tokens.access || !result.tokens.refresh) {
        console.error('❌ [LOGIN] Tokens missing in API response:', result);
        toast.error('Login failed: No tokens received from server');
        return;
      }

      console.log('🔵 [LOGIN] Tokens received - Access:', result.tokens.access?.substring(0, 20) + '...', 'Refresh:', result.tokens.refresh?.substring(0, 20) + '...');

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

      // Store tokens with user info - this should persist in localStorage
      updateAuthTokens(result.tokens.access, result.tokens.refresh, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Verify tokens were stored
      const stored = localStorage.getItem('ev_nexus_auth_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('✅ [LOGIN] Tokens stored in localStorage:', {
          hasAccessToken: !!parsed.accessToken,
          hasRefreshToken: !!parsed.refreshToken,
          hasUser: !!parsed.user,
        });
      } else {
        console.error('❌ [LOGIN] Failed to store tokens in localStorage');
      }

      // Don't call clearNonAuthStorage during login - we just stored fresh tokens
      // It will be called on app initialization if needed

      // Ensure tokens are stored before dispatching setCredentials
      // Sometimes setCredentials might not persist correctly, so we ensure it's stored first
      const tokensAreStored = localStorage.getItem('ev_nexus_auth_data');
      if (!tokensAreStored) {
        console.warn('⚠️ [LOGIN] Tokens not in localStorage before setCredentials, storing again...');
        updateAuthTokens(result.tokens.access, result.tokens.refresh, {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        });
      }

      // Dispatch credentials to update Redux state (this also stores tokens via setStoredAuth)
      dispatch(setCredentials({
        user,
        accessToken: result.tokens.access,
        refreshToken: result.tokens.refresh,
      }));

      // Force store tokens again after setCredentials to ensure they persist
      // This is a safety measure in case setStoredAuth fails or doesn't execute
      updateAuthTokens(result.tokens.access, result.tokens.refresh, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Immediate check after dispatch
      const immediateCheck = localStorage.getItem('ev_nexus_auth_data');
      if (immediateCheck) {
        const parsed = JSON.parse(immediateCheck);
        console.log('✅ [LOGIN] Immediate check after setCredentials - Tokens in localStorage:', {
          hasAccessToken: !!parsed.accessToken,
          hasRefreshToken: !!parsed.refreshToken,
          hasUser: !!parsed.user,
        });
      } else {
        console.error('❌ [LOGIN] Immediate check after setCredentials - localStorage is EMPTY!');
        // Final emergency restore attempt
        console.log('🔄 [LOGIN] Final emergency restore attempt...');
        updateAuthTokens(result.tokens.access, result.tokens.refresh, {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        });
      }

      // Final verification after setCredentials (with delay)
      setTimeout(() => {
        const finalCheck = localStorage.getItem('ev_nexus_auth_data');
        if (finalCheck) {
          const parsed = JSON.parse(finalCheck);
          console.log('✅ [LOGIN] Final check (after delay) - Tokens still in localStorage:', {
            hasAccessToken: !!parsed.accessToken,
            hasRefreshToken: !!parsed.refreshToken,
            hasUser: !!parsed.user,
          });
        } else {
          console.error('❌ [LOGIN] Final check (after delay) - localStorage is EMPTY!');
          // Emergency restore if still empty
          console.log('🔄 [LOGIN] Attempting emergency restore again...');
          updateAuthTokens(result.tokens.access, result.tokens.refresh, {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          });
        }
      }, 500);

      dispatch(loadBookingsForUser(user.id));
      toast.success('Welcome back!');

      // Redirect based on user role from API response
      const userRole = result.user.role?.toLowerCase();
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "staff") {
        navigate("/staff/leads", { replace: true });
      } else if (result.user.is_distributor || user.isDistributor) {
        navigate("/distributor", { replace: true });
      } else {
        // Regular user - redirect to homepage
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      console.log('🔴 [VERIFY LOGIN OTP] Error Response:', JSON.stringify(err, null, 2));
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

  const validateSignupForm = (): boolean => {
    const newErrors: Partial<Record<keyof SignupFormData, string>> = {};

    if (!signupData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!signupData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!signupData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!signupData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10,12}$/.test(signupData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10-12 digits';
    }

    if (!signupData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!signupData.date_of_birth) {
      newErrors.date_of_birth = 'Date of Birth is required';
    } else {
      const dob = new Date(signupData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        newErrors.date_of_birth = 'You must be at least 18 years old';
      }
    }

    if (!signupData.address_line1.trim()) {
      newErrors.address_line1 = 'Address line 1 is required';
    }

    if (!signupData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!signupData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!signupData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(signupData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setSignupErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }

    setIsSubmitting(true);
    setSignupErrors({});

    try {
      const signupPayload = {
        first_name: signupData.first_name.trim(),
        last_name: signupData.last_name.trim(),
        email: signupData.email.trim().toLowerCase(),
        mobile: signupData.mobile.trim(),
        gender: signupData.gender,
        date_of_birth: signupData.date_of_birth,
        address_line1: signupData.address_line1.trim(),
        address_line2: signupData.address_line2.trim() || undefined,
        city: signupData.city.trim(),
        state: signupData.state.trim(),
        pincode: signupData.pincode.trim(),
        country: signupData.country || 'India',
      };

      console.log('🔵 [SIGNUP] Request Body:', JSON.stringify(signupPayload, null, 2));
      const result = await signup(signupPayload).unwrap();
      console.log('🟢 [SIGNUP] Response:', JSON.stringify(result, null, 2));
      
      setSignupToken(result.signup_token);
      setShowOTPVerification(true);
      toast.success(result.message || 'OTP sent to both email and mobile');
    } catch (err: unknown) {
      console.log('🔴 [SIGNUP] Error Response:', JSON.stringify(err, null, 2));
      let errorMessage = 'Failed to create account. Please try again.';
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupToken) {
      toast.error('Signup token is missing. Please try signing up again.');
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpError("");

    try {
      const otpPayload = {
        signup_token: signupToken,
        otp_code: otpCode,
      };
      console.log('🔵 [VERIFY OTP] Request Body:', JSON.stringify(otpPayload, null, 2));
      const result = await verifySignupOTP(otpPayload).unwrap();
      console.log('🟢 [VERIFY OTP] Response:', JSON.stringify(result, null, 2));

      // Validate tokens exist in response
      if (!result.tokens || !result.tokens.access || !result.tokens.refresh) {
        console.error('❌ [SIGNUP] Tokens missing in API response:', result);
        toast.error('Signup failed: No tokens received from server');
        return;
      }

      console.log('🔵 [SIGNUP] Tokens received - Access:', result.tokens.access?.substring(0, 20) + '...', 'Refresh:', result.tokens.refresh?.substring(0, 20) + '...');

      // Convert API user to app User format
      const user = {
        id: result.user.id.toString(),
        name: `${result.user.first_name} ${result.user.last_name}`,
        email: result.user.email,
        role: result.user.role as 'admin' | 'staff' | 'user',
        isDistributor: result.user.is_distributor || false,
        phone: result.user.mobile,
        joinedAt: new Date().toISOString(),
      };

      // Store tokens with user info - this should persist in localStorage
      updateAuthTokens(result.tokens.access, result.tokens.refresh, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Verify tokens were stored
      const stored = localStorage.getItem('ev_nexus_auth_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('✅ [SIGNUP] Tokens stored in localStorage:', {
          hasAccessToken: !!parsed.accessToken,
          hasRefreshToken: !!parsed.refreshToken,
          hasUser: !!parsed.user,
        });
      } else {
        console.error('❌ [SIGNUP] Failed to store tokens in localStorage');
      }

      // Don't call clearNonAuthStorage during signup - we just stored fresh tokens
      // It will be called on app initialization if needed

      // Dispatch credentials to update Redux state (this also stores tokens via setStoredAuth)
      dispatch(setCredentials({
        user,
        accessToken: result.tokens.access,
        refreshToken: result.tokens.refresh,
      }));

      dispatch(loadBookingsForUser(user.id));
      toast.success('Account created successfully! Welcome!');

      // Redirect based on user role from API response
      const userRole = result.user.role?.toLowerCase();
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "staff") {
        navigate("/staff/leads", { replace: true });
      } else if (result.user.is_distributor || user.isDistributor) {
        navigate("/distributor", { replace: true });
      } else {
        // Regular user - redirect to home
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      console.log('🔴 [VERIFY OTP] Error Response:', JSON.stringify(err, null, 2));
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
      setOtpError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleSignupInputChange = (field: keyof SignupFormData, value: string) => {
    setSignupData((prev) => ({ ...prev, [field]: value }));
    if (signupErrors[field]) {
      setSignupErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: keyof SignupFormData, value: string) => {
    handleSignupInputChange(field, value);
  };

  const imageVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 }
  };

  const formVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {!isSignupMode ? (
          // LOGIN MODE: Image Left, Form Right
          <motion.div
            key="login-layout"
            initial="initial"
            animate="animate"
            exit="exit"
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
                  <h1 className="text-5xl font-bold tracking-tight">
                    Zuja Electric Scooters
                  </h1>
                  <p className="text-xl text-white/80 max-w-md">
                    Driving a Smarter, Cleaner Electric Future
                  </p>
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600">
                    Please sign in to your account to continue
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
                        <Label htmlFor="loginOtp" className="text-sm font-medium">Enter OTP *</Label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="loginOtp"
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

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gradient-to-br from-white to-gray-50 px-2 text-gray-500">Or</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50 hover:text-gray-900 text-gray-900 transition-all"
                      onClick={() => setIsSignupMode(true)}
                    >
                      Create New Account
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          // SIGNUP MODE: Form Left, Image Right
          <motion.div
            key="signup-layout"
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex w-full"
          >
            {/* Left Column - Signup Form */}
            <motion.div
              variants={formVariants}
              className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 p-8 overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-md"
              >
                <div className="mb-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSignupMode(false)}
                    className="mb-4 -ml-2 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-gray-900" />
                    Create Account
                  </h2>
                  <p className="text-gray-600">
                    Join us and start your electric journey today
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-sm font-medium">First Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="first_name"
                          type="text"
                          placeholder="Enter first name"
                          value={signupData.first_name}
                          onChange={(e) => handleSignupInputChange('first_name', e.target.value)}
                          className={`pl-10 h-11 ${signupErrors.first_name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                        />
                      </div>
                      {signupErrors.first_name && <p className="text-xs text-red-500">{signupErrors.first_name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-sm font-medium">Last Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="last_name"
                          type="text"
                          placeholder="Enter last name"
                          value={signupData.last_name}
                          onChange={(e) => handleSignupInputChange('last_name', e.target.value)}
                          className={`pl-10 h-11 ${signupErrors.last_name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                        />
                      </div>
                      {signupErrors.last_name && <p className="text-xs text-red-500">{signupErrors.last_name}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupData.email}
                        onChange={(e) => handleSignupInputChange('email', e.target.value)}
                        className={`pl-10 h-11 ${signupErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                      />
                    </div>
                    {signupErrors.email && <p className="text-xs text-red-500">{signupErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-sm font-medium">Mobile *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="Enter mobile number"
                        value={signupData.mobile}
                        onChange={(e) => handleSignupInputChange('mobile', e.target.value.replace(/\D/g, ''))}
                        maxLength={12}
                        className={`pl-10 h-11 ${signupErrors.mobile ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                      />
                    </div>
                    {signupErrors.mobile && <p className="text-xs text-red-500">{signupErrors.mobile}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">Gender *</Label>
                    <Select
                      value={signupData.gender}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger className={`h-11 ${signupErrors.gender ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'}`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {signupErrors.gender && <p className="text-xs text-red-500">{signupErrors.gender}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="text-sm font-medium">Date of Birth *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={signupData.date_of_birth}
                        onChange={(e) => handleSignupInputChange('date_of_birth', e.target.value)}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        className={`pl-10 h-11 ${signupErrors.date_of_birth ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                      />
                    </div>
                    {signupErrors.date_of_birth && <p className="text-xs text-red-500">{signupErrors.date_of_birth}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_line1" className="text-sm font-medium">Address Line 1 *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="address_line1"
                        type="text"
                        placeholder="Enter address line 1"
                        value={signupData.address_line1}
                        onChange={(e) => handleSignupInputChange('address_line1', e.target.value)}
                        className={`pl-10 h-11 ${signupErrors.address_line1 ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                      />
                    </div>
                    {signupErrors.address_line1 && <p className="text-xs text-red-500">{signupErrors.address_line1}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_line2" className="text-sm font-medium">Address Line 2</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="address_line2"
                        type="text"
                        placeholder="Enter address line 2 (Optional)"
                        value={signupData.address_line2}
                        onChange={(e) => handleSignupInputChange('address_line2', e.target.value)}
                        className="pl-10 h-11 border-gray-300 focus:border-gray-900 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="city"
                          type="text"
                          placeholder="Enter city"
                          value={signupData.city}
                          onChange={(e) => handleSignupInputChange('city', e.target.value)}
                          className={`pl-10 h-11 ${signupErrors.city ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                        />
                      </div>
                      {signupErrors.city && <p className="text-xs text-red-500">{signupErrors.city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium">State *</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="state"
                          type="text"
                          placeholder="Enter state"
                          value={signupData.state}
                          onChange={(e) => handleSignupInputChange('state', e.target.value)}
                          className={`pl-10 h-11 ${signupErrors.state ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                        />
                      </div>
                      {signupErrors.state && <p className="text-xs text-red-500">{signupErrors.state}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-sm font-medium">Pincode *</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="pincode"
                          type="text"
                          placeholder="Enter 6-digit pincode"
                          value={signupData.pincode}
                          onChange={(e) => handleSignupInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                          maxLength={6}
                          className={`pl-10 h-11 ${signupErrors.pincode ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                        />
                      </div>
                      {signupErrors.pincode && <p className="text-xs text-red-500">{signupErrors.pincode}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="country"
                          type="text"
                          placeholder="Enter country"
                          value={signupData.country}
                          onChange={(e) => handleSignupInputChange('country', e.target.value)}
                          className="pl-10 h-11 border-gray-300 focus:border-gray-900 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-lg hover:shadow-xl mt-6"
                    disabled={isSubmitting || isSigningUp}
                  >
                    {isSubmitting || isSigningUp ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                {/* OTP Verification Section */}
                {showOTPVerification && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-gray-900" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          Verify Your Account
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Enter the 6-digit OTP sent to your email and mobile number
                      </p>
                    </div>

                    <form onSubmit={handleOTPVerification} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="text-sm font-medium">OTP Code *</Label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="otp"
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otpCode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                              setOtpCode(value);
                              if (otpError) setOtpError("");
                            }}
                            maxLength={6}
                            className={`pl-10 h-12 text-center text-2xl tracking-widest font-mono ${otpError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                            autoFocus
                          />
                        </div>
                        {otpError && <p className="text-xs text-red-500">{otpError}</p>}
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-lg hover:shadow-xl"
                        disabled={isVerifyingOTP || !otpCode || otpCode.length !== 6}
                      >
                        {isVerifyingOTP ? 'Verifying...' : 'Verify OTP'}
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setShowOTPVerification(false);
                            setSignupToken(null);
                            setOtpCode("");
                            setOtpError("");
                          }}
                          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Go back to signup form
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Right Column - Brand Section */}
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
                  <h1 className="text-5xl font-bold tracking-tight">
                    Join the Revolution
                  </h1>
                  <p className="text-xl text-white/80 max-w-md">
                    Start your journey towards a sustainable future with electric mobility
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

