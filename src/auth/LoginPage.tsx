import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCredentials, isUserAuthenticated } from "@/app/slices/authSlice";
import { loadBookingsForUser } from "@/app/slices/bookingSlice";
import { useLoginMutation } from "@/app/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SignupModal } from "./SignupModal";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  // Get the previous location from state, or default to home
  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  // If already authenticated (check both Redux state and localStorage), redirect based on role
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
      // Load bookings for the logged-in user
      dispatch(loadBookingsForUser(result.user.id));
      toast.success("Welcome back!");

      // Redirect based on role, but prioritize the previous location for regular users
      if (result.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (result.user.role === "staff") {
        navigate("/staff/leads", { replace: true });
      } else if (result.user.isDistributor) {
        navigate("/distributor", { replace: true });
      } else {
        // For regular users, go back to where they came from, or default to home
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

  const handleSignupSuccess = () => {
    toast.success("Account created! You can now login with your credentials.");
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

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&h=1600&fit=crop&q=80)",
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90" />

        {/* Brand Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white w-full">
          {/* Decorative brackets */}
          <div className="absolute top-12 left-12 w-8 h-8 border-l-2 border-t-2 border-white/30" />
          <div className="absolute bottom-12 right-12 w-8 h-8 border-r-2 border-b-2 border-white/30" />

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
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
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
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

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
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
                className="pl-10 pr-10 h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="text-right">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Forgot password?
              </a>
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white"
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
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
                onClick={() => setIsSignupModalOpen(true)}
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
                  className="capitalize border-gray-300 hover:bg-gray-50"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignupSuccess={handleSignupSuccess}
      />
    </div>
  );
};
