import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, Eye, EyeOff, User, Calendar, Phone, CreditCard,
  ArrowLeft, Sparkles
} from "lucide-react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCredentials, isUserAuthenticated } from "@/app/slices/authSlice";
import { loadBookingsForUser } from "@/app/slices/bookingSlice";
import { useLoginMutation } from "@/app/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SignupFormData {
  name: string;
  dateOfBirth: string;
  phone: string;
  aadhar: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const STORAGE_KEY = 'ev_nexus_users';

// Store user data in localStorage
function storeUser(userData: Omit<SignupFormData, 'confirmPassword'> & { id: string; joinedAt: string }): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existingUsers = localStorage.getItem(STORAGE_KEY);
    const users = existingUsers ? JSON.parse(existingUsers) : [];
    
    if (users.some((u: any) => u.email === userData.email)) {
      throw new Error('Email already registered');
    }
    
    users.push(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error storing user:', error);
    throw error;
  }
}

export const LoginPage = () => {
  const [isSignupMode, setIsSignupMode] = useState(false);
  
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup state
  const [signupData, setSignupData] = useState<SignupFormData>({
    name: '',
    dateOfBirth: '',
    phone: '',
    aadhar: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

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
      redirectPath = from && from !== "/login" ? from : "/profile";
    }

    return <Navigate to={redirectPath} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      dispatch(loadBookingsForUser(result.user.id));
      toast.success("Welcome back!");

      if (result.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (result.user.role === "staff") {
        navigate("/staff/leads", { replace: true });
      } else if (result.user.isDistributor) {
        navigate("/distributor", { replace: true });
      } else {
        navigate(from !== "/login" ? from : "/", { replace: true });
      }
    } catch (err: unknown) {
      let errorMessage = "Invalid email or password";
      if (err && typeof err === "object") {
        const error = err as {
          data?: { data?: string; message?: string } | string;
          error?: string;
          message?: string;
        };
        errorMessage =
          (typeof error.data === "object" &&
            (error.data?.data || error.data?.message)) ||
          (typeof error.data === "string" ? error.data : undefined) ||
          error.error ||
          error.message ||
          errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const validateSignupForm = (): boolean => {
    const newErrors: Partial<Record<keyof SignupFormData, string>> = {};

    if (!signupData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!signupData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of Birth is required';
    } else {
      const dob = new Date(signupData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }

    if (!signupData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(signupData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!signupData.aadhar.trim()) {
      newErrors.aadhar = 'Aadhar number is required';
    } else if (!/^[0-9]{12}$/.test(signupData.aadhar)) {
      newErrors.aadhar = 'Aadhar number must be 12 digits';
    }

    if (!signupData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    try {
      const existingUsers = localStorage.getItem(STORAGE_KEY);
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      if (users.some((u: any) => u.email === signupData.email)) {
        toast.error('Email already registered. Please use a different email or login.');
        setSignupErrors({ email: 'Email already registered' });
        setIsSubmitting(false);
        return;
      }

      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const userData = {
        id: userId,
        name: signupData.name.trim(),
        dateOfBirth: signupData.dateOfBirth,
        phone: signupData.phone.trim(),
        aadhar: signupData.aadhar.trim(),
        email: signupData.email.trim().toLowerCase(),
        password: signupData.password,
        joinedAt: new Date().toISOString(),
      };

      storeUser(userData);

      toast.success('Account created successfully! You can now login.');
      
      setSignupData({
        name: '',
        dateOfBirth: '',
        phone: '',
        aadhar: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setSignupErrors({});
      setIsSignupMode(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupInputChange = (field: keyof SignupFormData, value: string) => {
    setSignupData((prev) => ({ ...prev, [field]: value }));
    if (signupErrors[field]) {
      setSignupErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const quickLogin = (type: string) => {
    const emails: Record<string, string> = {
      admin: "admin@zuja.com",
      staff: "staff@zuja.com",
      distributor: "distributor@zuja.com",
      user: "user@zuja.com",
    };
    setEmail(emails[type]);
    setPassword("demo123");
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

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900 transition-all"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <div className="text-right">
                    <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

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

                <div className="mt-8">
                  <p className="mb-4 text-center text-sm text-gray-600">
                    Quick login as:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {["admin", "staff", "user"].map((type) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        onClick={() => quickLogin(type)}
                        className="capitalize border-gray-300 hover:bg-gray-50 hover:text-gray-900 text-gray-900 transition-all"
                      >
                        {type}
                      </Button>
                    ))}
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
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupData.name}
                        onChange={(e) => handleSignupInputChange('name', e.target.value)}
                        className={`pl-10 h-11 ${signupErrors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                      />
                    </div>
                    {signupErrors.name && <p className="text-xs text-red-500">{signupErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={signupData.dateOfBirth}
                        onChange={(e) => handleSignupInputChange('dateOfBirth', e.target.value)}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        className={`pl-10 h-11 ${signupErrors.dateOfBirth ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                      />
                    </div>
                    {signupErrors.dateOfBirth && <p className="text-xs text-red-500">{signupErrors.dateOfBirth}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter 10-digit phone number"
                        value={signupData.phone}
                        onChange={(e) => handleSignupInputChange('phone', e.target.value.replace(/\D/g, ''))}
                        maxLength={10}
                        className={`pl-10 h-11 ${signupErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                      />
                    </div>
                    {signupErrors.phone && <p className="text-xs text-red-500">{signupErrors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aadhar" className="text-sm font-medium">Aadhar Number *</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="aadhar"
                        type="text"
                        placeholder="Enter 12-digit Aadhar number"
                        value={signupData.aadhar}
                        onChange={(e) => handleSignupInputChange('aadhar', e.target.value.replace(/\D/g, ''))}
                        maxLength={12}
                        className={`pl-10 h-11 ${signupErrors.aadhar ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                      />
                    </div>
                    {signupErrors.aadhar && <p className="text-xs text-red-500">{signupErrors.aadhar}</p>}
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
                    <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="password"
                        type={showSignupPassword ? 'text' : 'password'}
                        placeholder="Enter password (min 6 characters)"
                        value={signupData.password}
                        onChange={(e) => handleSignupInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 h-11 ${signupErrors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showSignupPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {signupErrors.password && <p className="text-xs text-red-500">{signupErrors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={signupData.confirmPassword}
                        onChange={(e) => handleSignupInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 pr-10 h-11 ${signupErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'} transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {signupErrors.confirmPassword && <p className="text-xs text-red-500">{signupErrors.confirmPassword}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-lg hover:shadow-xl mt-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
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
