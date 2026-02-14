import { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Package,
  Heart,
  CreditCard,
  Settings,
  Gift,
  FileText,
  Award,
  Users,
  UserPlus,
  DollarSign,
  Link as LinkIcon,
  GitBranch,
  Wallet,
  MapPin,
  ChevronRight,
  ShoppingBag,
  Calendar,
  Shield,
  FileCheck,
  RefreshCw,
  Upload,
  CheckCircle2,
  FileText as FileTextIcon,
  ExternalLink,
  Copy,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { Link } from "react-router-dom";
import { MyOrders } from "./profile/MyOrders";
import { Wishlist } from "./profile/Wishlist";
import { PaymentMethods } from "./profile/PaymentMethods";
import { DistributorOptions } from "./profile/DistributorOptions";
import { Addresses } from "./profile/Addresses";
import { KYCVerification } from "./profile/KYCVerification";
import { useGetUserProfileQuery, useGetUserProfileRawQuery, useUpdateProfileMutation, useSubmitNomineeMutation, useGetNomineeDetailsQuery, useSubmitNomineeKYCMutation } from "@/app/api/userApi";
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { setCredentials } from "@/app/slices/authSlice";
import { useGetBookingsQuery } from "@/app/api/bookingApi";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "orders"
  );
  
  // Redirect admin users - they should not access this page
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  // Fetch user profile using the new API - skip for admin (safety check)
  const { data: profileData, refetch: refetchProfile, isLoading: isLoadingProfile } = useGetUserProfileQuery(undefined, {
    skip: user?.role === 'admin',
  });
  
  // Fetch raw profile data - always fetch to get days_remaining_for_full_payment and active_buyer_warning - skip for admin
  const { data: rawProfileData, refetch: refetchRawProfile, isLoading: isLoadingRawProfile } = useGetUserProfileRawQuery(undefined, {
    skip: user?.role === 'admin',
  });
  
  // Update profile mutation
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  
  // Submit nominee mutation
  const [submitNominee, { isLoading: isSubmittingNominee }] = useSubmitNomineeMutation();
  
  // Submit nominee KYC mutation
  const [submitNomineeKYC, { isLoading: isSubmittingNomineeKYC }] = useSubmitNomineeKYCMutation();
  
  // Fetch nominee details (only when nominee tab is active) - skip for admin
  const { data: nomineeData, isLoading: isLoadingNominee, error: nomineeError, refetch: refetchNominee } = useGetNomineeDetailsQuery(undefined, {
    skip: activeTab !== "nominee" || user?.role === 'admin',
  });
  
  // Fetch bookings count from API to display accurate count - skip for admin
  const { data: bookingsData } = useGetBookingsQuery(undefined, {
    skip: user?.role === 'admin',
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  });
  
  // Log profile data when received
  useEffect(() => {
    if (profileData) {
      console.log('📋 [PROFILE PAGE] Profile data received:', profileData);
    }
  }, [profileData]);

  // Log nominee data when received
  useEffect(() => {
    if (nomineeData) {
      console.log('📋 [PROFILE PAGE] Nominee data received:', nomineeData);
      console.log('📋 [PROFILE PAGE] Nominee data (stringified):', JSON.stringify(nomineeData, null, 2));
    }
    if (nomineeError) {
      console.log('📋 [PROFILE PAGE] Nominee error:', nomineeError);
    }
  }, [nomineeData, nomineeError]);
  
  // Update Redux state when profile data is fetched
  useEffect(() => {
    if (profileData) {
      console.log('📋 [PROFILE PAGE] Updating Redux state with profile data:', profileData);
      dispatch(setCredentials({ user: profileData }));
    }
  }, [profileData, dispatch]);

  // Use profileData directly if available, otherwise fallback to Redux user
  const currentUser = profileData || user;
  const kycStatus: 'not_submitted' | 'pending' | 'verified' | 'approved' | 'rejected' = 
    currentUser?.kycStatus === null ? 'not_submitted' : (currentUser?.kycStatus || 'not_submitted') as 'not_submitted' | 'pending' | 'verified' | 'approved' | 'rejected';

  const handleRefresh = () => {
    refetchProfile();
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Check if user is a distributor from profile data (use fresh API data if available)
  const isDistributor = currentUser?.isDistributor || false;

  // Form state for profile editing
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    gender: "",
    date_of_birth: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  // Form state for nominee
  const [nomineeFormData, setNomineeFormData] = useState({
    full_name: "",
    relationship: "",
    date_of_birth: "",
    mobile: "",
    email: "",
    address_line1: "",
    city: "",
    state: "",
    pincode: "",
    id_proof_type: "",
    id_proof_number: "",
  });
  const [nomineeIdProofDocument, setNomineeIdProofDocument] = useState<File | null>(null);
  const [isEditingNominee, setIsEditingNominee] = useState(false);

  // Initialize nominee form data when nominee data is loaded
  useEffect(() => {
    if (nomineeData && activeTab === "nominee") {
      console.log('📋 [PROFILE PAGE] Pre-filling nominee form with data:', nomineeData);
      setNomineeFormData({
        full_name: nomineeData.full_name || "",
        relationship: nomineeData.relationship || "",
        date_of_birth: nomineeData.date_of_birth || "",
        mobile: nomineeData.mobile || "",
        email: nomineeData.email || "",
        address_line1: nomineeData.address_line1 || "",
        city: nomineeData.city || "",
        state: nomineeData.state || "",
        pincode: nomineeData.pincode || "",
        id_proof_type: nomineeData.id_proof_type || "",
        id_proof_number: nomineeData.id_proof_number || "",
      });
      setIsEditingNominee(true);
      setNomineeIdProofDocument(null); // Don't pre-fill file, user needs to re-upload if changing
    } else if (activeTab === "nominee" && !nomineeData) {
      // Reset form when switching to nominee tab and no data exists
      setNomineeFormData({
        full_name: "",
        relationship: "",
        date_of_birth: "",
        mobile: "",
        email: "",
        address_line1: "",
        city: "",
        state: "",
        pincode: "",
        id_proof_type: "",
        id_proof_number: "",
      });
      setIsEditingNominee(false);
      setNomineeIdProofDocument(null);
    }
  }, [nomineeData, activeTab]);

  // Initialize form data when raw profile data is loaded
  useEffect(() => {
    if (rawProfileData && activeTab === "settings") {
      setFormData({
        first_name: rawProfileData.first_name || "",
        last_name: rawProfileData.last_name || "",
        email: rawProfileData.email || "",
        mobile: rawProfileData.mobile || "",
        gender: rawProfileData.gender || "",
        date_of_birth: rawProfileData.date_of_birth || "",
        address_line1: rawProfileData.address_line1 || "",
        address_line2: rawProfileData.address_line2 || "",
        city: rawProfileData.city || "",
        state: rawProfileData.state || "",
        pincode: rawProfileData.pincode || "",
        country: rawProfileData.country || "India",
      });
      // Set profile picture preview if available
      if (rawProfileData.profile_picture) {
        setProfilePicturePreview(rawProfileData.profile_picture);
      } else {
        setProfilePicturePreview(null);
      }
      setProfilePicture(null); // Reset file input when loading existing data
    }
  }, [rawProfileData, activeTab]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle nominee form input changes
  const handleNomineeInputChange = (field: string, value: string) => {
    setNomineeFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle nominee file change
  const handleNomineeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNomineeIdProofDocument(file);
    }
  };

  // Handle profile picture file change
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WEBP)");
        return;
      }
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setProfilePicture(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare the request body with profile picture if provided
      const requestBody: {
        first_name: string;
        last_name: string;
        email: string;
        mobile: string;
        gender: string;
        date_of_birth: string;
        address_line1: string;
        city: string;
        state: string;
        pincode: string;
        address_line2?: string;
        country?: string;
        profile_picture?: File;
      } = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        mobile: formData.mobile,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        address_line1: formData.address_line1,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      };

      // Add optional fields only if they have values
      if (formData.address_line2) {
        requestBody.address_line2 = formData.address_line2;
      }
      if (formData.country) {
        requestBody.country = formData.country;
      }
      if (profilePicture) {
        requestBody.profile_picture = profilePicture;
      }

      // Call the update profile API
      await updateProfile(requestBody).unwrap();
      
      // Show success message
      toast.success("Profile updated successfully!");
      
      // Clear profile picture file input after successful upload
      setProfilePicture(null);
      
      // Refetch both profile queries to update the UI and cache
      await Promise.all([refetchProfile(), refetchRawProfile()]);
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message 
        : undefined;
      toast.error(errorMessage || "Failed to update profile. Please try again.");
    }
  };

  // Handle nominee form submission
  const handleNomineeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only require file for new nominees, not when editing
    if (!isEditingNominee && !nomineeIdProofDocument) {
      toast.error("Please upload ID proof document");
      return;
    }
    
    // When editing, file is optional (user can update other fields without re-uploading document)
    // But if they want to update the document, they need to upload a new one
    
    try {
      const submitData: {
        full_name: string;
        relationship: string;
        date_of_birth: string;
        mobile: string;
        email: string;
        address_line1: string;
        city: string;
        state: string;
        pincode: string;
        id_proof_type: string;
        id_proof_number: string;
        id_proof_document?: File;
        nomineeId?: number;
      } = {
        full_name: nomineeFormData.full_name,
        relationship: nomineeFormData.relationship,
        date_of_birth: nomineeFormData.date_of_birth,
        mobile: nomineeFormData.mobile,
        email: nomineeFormData.email,
        address_line1: nomineeFormData.address_line1,
        city: nomineeFormData.city,
        state: nomineeFormData.state,
        pincode: nomineeFormData.pincode,
        id_proof_type: nomineeFormData.id_proof_type,
        id_proof_number: nomineeFormData.id_proof_number,
      };
      
      // Include nominee ID if editing (will use PUT method)
      if (isEditingNominee && nomineeData?.id) {
        submitData.nomineeId = nomineeData.id;
      }
      
      // Only include file if provided (required for new, optional for edit)
      if (nomineeIdProofDocument) {
        submitData.id_proof_document = nomineeIdProofDocument;
      }
      
      // Console log the API body
      const method = isEditingNominee ? 'PUT' : 'POST';
      console.log(`📤 [PROFILE PAGE] ========== Submitting Nominee Data (${method}) ==========`);
      console.log('📤 [PROFILE PAGE] Is Editing:', isEditingNominee);
      console.log(`📤 [PROFILE PAGE] ${method} API Body:`, {
        nomineeId: submitData.nomineeId,
        method: method,
        full_name: submitData.full_name,
        relationship: submitData.relationship,
        date_of_birth: submitData.date_of_birth,
        mobile: submitData.mobile,
        email: submitData.email,
        address_line1: submitData.address_line1,
        city: submitData.city,
        state: submitData.state,
        pincode: submitData.pincode,
        id_proof_type: submitData.id_proof_type,
        id_proof_number: submitData.id_proof_number,
        id_proof_document: submitData.id_proof_document 
          ? `File: ${submitData.id_proof_document.name} (${submitData.id_proof_document.size} bytes, type: ${submitData.id_proof_document.type})` 
          : 'Not provided (optional when editing)',
      });
      console.log(`📤 [PROFILE PAGE] ${method} API Body (stringified):`, JSON.stringify({
        ...submitData,
        id_proof_document: submitData.id_proof_document 
          ? `File: ${submitData.id_proof_document.name} (${submitData.id_proof_document.size} bytes, type: ${submitData.id_proof_document.type})` 
          : 'Not provided',
      }, null, 2));
      
      await submitNominee(submitData).unwrap();
      
      toast.success(isEditingNominee ? "Nominee updated successfully!" : "Nominee added successfully!");
      
      // Don't reset form when editing - keep the data
      if (!isEditingNominee) {
        setNomineeFormData({
          full_name: "",
          relationship: "",
          date_of_birth: "",
          mobile: "",
          email: "",
          address_line1: "",
          city: "",
          state: "",
          pincode: "",
          id_proof_type: "",
          id_proof_number: "",
        });
        setNomineeIdProofDocument(null);
      } else {
        // When editing, clear the file input but keep form data
        setNomineeIdProofDocument(null);
      }
      
      // Refetch profile and nominee data to update UI
      await Promise.all([refetchProfile(), refetchNominee()]);
    } catch (error) {
      console.error("Error submitting nominee:", error);
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message 
        : undefined;
      toast.error(errorMessage || `Failed to ${isEditingNominee ? 'update' : 'add'} nominee. Please try again.`);
    }
  };

  // Handle nominee KYC submission
  const handleSubmitNomineeKYC = async () => {
    try {
      const result = await submitNomineeKYC().unwrap();
      toast.success(result.message || "Nominee KYC submitted successfully!");
      
      // Refetch profile and raw profile to update nominee_kyc_status
      await Promise.all([refetchProfile(), refetchRawProfile()]);
    } catch (error) {
      console.error("Error submitting nominee KYC:", error);
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message 
        : undefined;
      toast.error(errorMessage || "Failed to submit nominee KYC. Please try again.");
    }
  };

  const profileSections = [
    { id: "orders", label: "My Orders", icon: Package, count: bookingsData?.count || 0 },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: Heart,
      count: wishlistItems.length,
    },
    { id: "kyc", label: "KYC Verification", icon: Shield },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "nominee", label: "Add Nominee", icon: UserPlus },
    //{ id: "addresses", label: "Addresses", icon: MapPin },
    //{ id: "redemption", label: "Redemption Points", icon: Gift },
    { id: "referral", label: "Referral Link", icon: LinkIcon },
    { id: "settings", label: "Edit Profile", icon: Settings },
    // ...(isDistributor
    //   ? [{ id: "distributor", label: "ASA(Authorized Sales Associate)", icon: Award }]
    //   : []),
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50/80 via-background to-background">
      <div className="w-full px-3 sm:px-4 py-4">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                    My Account
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isLoadingProfile}
                    className="h-8 w-8 rounded-full hover:bg-pink-500/10"
                    title="Refresh profile"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingProfile ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                {/* Days Remaining for Full Payment - Striking Display */}
                {rawProfileData?.days_remaining_for_full_payment !== undefined && rawProfileData.days_remaining_for_full_payment !== null && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 border-2 border-orange-400/50"
                  >
                    <Clock className="h-5 w-5 animate-pulse" />
                    <span className="font-bold text-base sm:text-lg">
                      {rawProfileData.days_remaining_for_full_payment} {rawProfileData.days_remaining_for_full_payment === 1 ? 'Day' : 'Days'} Remaining
                    </span>
                  </motion.div>
                )}
                {kycStatus && kycStatus !== 'not_submitted' ? (
                  <Badge
                    variant={
                      kycStatus === 'verified' || kycStatus === 'approved'
                        ? 'default'
                        : kycStatus === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className={
                      kycStatus === 'verified' || kycStatus === 'approved'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-md shadow-pink-500/25'
                        : ''
                    }
                  >
                    {kycStatus === 'verified' || kycStatus === 'approved'
                      ? 'KYC Verified'
                      : kycStatus === 'pending'
                      ? 'KYC Pending'
                      : 'KYC Rejected'}
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white shadow-sm"
                  >
                    Not Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground tracking-tight">
                Manage your orders, profile, and preferences
              </p>
              {/* Active Buyer Warning */}
              {rawProfileData?.active_buyer_warning && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mt-2"
                >
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                  <p className="text-sm sm:text-base font-medium text-yellow-800 dark:text-yellow-200">
                    {rawProfileData.active_buyer_warning}
                  </p>
                </motion.div>
              )}
            </div>
            {/* Navigation Menu - Scrollable on mobile */}
            <nav className="flex overflow-x-auto gap-1.5 sm:gap-2 pb-2 -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
              {profileSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveTab(section.id);
                    setSearchParams({ tab: section.id });
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 shadow-sm ${
                    activeTab === section.id
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <section.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="inline sm:inline">{section.label}</span>
                  {section.count !== undefined && section.count > 0 && (
                    <Badge variant="secondary" className="text-xs h-4 sm:h-5 px-1 sm:px-1.5 bg-white/90 text-foreground">
                      {section.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Profile Section - Horizontal Layout */}
        <div className="mb-4" />

        {/* Main Content - Full Width */}
        <div className="w-full">
          {activeTab === "orders" && <MyOrders />}
          {activeTab === "wishlist" && <Wishlist />}
          {activeTab === "kyc" && <KYCVerification />}
          {activeTab === "payments" && <PaymentMethods />}
          {activeTab === "referral" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-primary" />
                  Your Referral Link
                </CardTitle>
                <CardDescription>
                  Share this link with friends and family to earn referral bonuses. You can start earning even before becoming an ASA(Authorized Sales Associate).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {isLoadingRawProfile ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner text="Loading referral link..." size="md" />
                  </div>
                ) : rawProfileData?.referral_link ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={rawProfileData.referral_link}
                          readOnly
                          className="w-full px-3 py-2 pr-12 border border-border rounded-md bg-muted text-sm sm:text-base font-mono cursor-text"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(rawProfileData.referral_link || '');
                            toast.success('Referral link copied to clipboard!');
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          title="Copy referral link"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-sm font-medium mb-2">How it works:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Share your referral link with friends and family</li>
                        <li>When they sign up using your link, they'll be associated with your account</li>
                        <li>You'll earn referral bonuses when they make purchases</li>
                        <li>Start earning even before becoming an ASA(Authorized Sales Associate)</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <LinkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Referral link will be available after account setup.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {activeTab === "nominee" && (
            <>
              {isLoadingNominee ? (
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner text="Loading nominee details..." size="md" />
                    </div>
                  </CardContent>
                </Card>
              ) : nomineeError && (nomineeError as FetchBaseQueryError)?.status !== 404 ? (
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-destructive mb-2">Failed to load nominee details</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {((nomineeError as FetchBaseQueryError)?.data as { message?: string })?.message || 'An error occurred while fetching nominee details'}
                      </p>
                      <Button onClick={() => refetchNominee()} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {isEditingNominee ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-pink-500" />
                          Edit Nominee Details
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Add Nominee Details
                        </>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {isEditingNominee 
                        ? "Update your nominee information for asset transfer purposes"
                        : "Add your nominee information for asset transfer purposes"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <form onSubmit={handleNomineeSubmit} className="space-y-4">
                  {/* Personal Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={nomineeFormData.full_name}
                          onChange={(e) => handleNomineeInputChange("full_name", e.target.value)}
                          placeholder="Enter nominee's full name"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Relationship <span className="text-red-500">*</span></label>
                        <select
                          value={nomineeFormData.relationship}
                          onChange={(e) => handleNomineeInputChange("relationship", e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                          required
                        >
                          <option value="">Select Relationship</option>
                          <option value="spouse">Spouse</option>
                          <option value="father">Father</option>
                          <option value="mother">Mother</option>
                          <option value="son">Son</option>
                          <option value="daughter">Daughter</option>
                          <option value="brother">Brother</option>
                          <option value="sister">Sister</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date of Birth <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={nomineeFormData.date_of_birth}
                          onChange={(e) => handleNomineeInputChange("date_of_birth", e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Mobile Number <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          value={nomineeFormData.mobile}
                          onChange={(e) => handleNomineeInputChange("mobile", e.target.value)}
                          placeholder="Enter mobile number"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={nomineeFormData.email}
                        onChange={(e) => handleNomineeInputChange("email", e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Address Details</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Address <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={nomineeFormData.address_line1}
                        onChange={(e) => handleNomineeInputChange("address_line1", e.target.value)}
                        placeholder="Enter full address"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">City <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={nomineeFormData.city}
                          onChange={(e) => handleNomineeInputChange("city", e.target.value)}
                          placeholder="Enter city"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">State <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={nomineeFormData.state}
                          onChange={(e) => handleNomineeInputChange("state", e.target.value)}
                          placeholder="Enter state"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Pincode <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={nomineeFormData.pincode}
                          onChange={(e) => handleNomineeInputChange("pincode", e.target.value)}
                          placeholder="Enter pincode"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* ID Proof Section */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">ID Proof Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ID Proof Type <span className="text-red-500">*</span></label>
                        <select
                          value={nomineeFormData.id_proof_type}
                          onChange={(e) => handleNomineeInputChange("id_proof_type", e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                          required
                        >
                          <option value="">Select ID Proof Type</option>
                          <option value="Aadhar">Aadhar Card</option>
                          <option value="PAN">PAN Card</option>
                          <option value="Passport">Passport</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="Driving License">Driving License</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ID Proof Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={nomineeFormData.id_proof_number}
                          onChange={(e) => handleNomineeInputChange("id_proof_number", e.target.value)}
                          placeholder="Enter ID proof number"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        ID Proof Document 
                        {!isEditingNominee && <span className="text-red-500">*</span>}
                        {isEditingNominee && <span className="text-muted-foreground text-xs ml-2">(Optional - upload new document to replace existing)</span>}
                      </label>
                      {isEditingNominee && nomineeData?.id_proof_document && (
                        <div className="mb-2 p-3 bg-muted/50 rounded-md">
                          <p className="text-xs text-muted-foreground mb-2">Current Document:</p>
                          <a
                            href={nomineeData.id_proof_document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <FileTextIcon className="w-4 h-4" />
                            View Current Document
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {nomineeIdProofDocument 
                                ? nomineeIdProofDocument.name 
                                : isEditingNominee 
                                  ? "Click to upload new ID proof document (optional)"
                                  : "Click to upload ID proof document"}
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleNomineeFileChange}
                            className="hidden"
                          />
                        </label>
                        {nomineeIdProofDocument && (
                          <p className="text-xs text-muted-foreground">
                            Selected: {nomineeIdProofDocument.name} ({(nomineeIdProofDocument.size / 1024).toFixed(2)} KB)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto" 
                          disabled={isSubmittingNominee}
                        >
                          {isSubmittingNominee 
                            ? (isEditingNominee ? "Updating..." : "Submitting...") 
                            : (isEditingNominee ? "Update Nominee Details" : "Submit Nominee Details")}
                        </Button>
                      </div>
                      
                      {/* Display nominee KYC status */}
                      {rawProfileData?.nominee_exists && rawProfileData?.nominee_kyc_status && (
                        <div className="mt-4 p-3 rounded-lg border" style={{
                          backgroundColor: 
                            rawProfileData.nominee_kyc_status === 'approved' || rawProfileData.nominee_kyc_status === 'verified'
                              ? 'rgba(34, 197, 94, 0.1)'
                              : rawProfileData.nominee_kyc_status === 'pending'
                                ? 'rgba(251, 191, 36, 0.1)'
                                : rawProfileData.nominee_kyc_status === 'rejected'
                                  ? 'rgba(239, 68, 68, 0.1)'
                                  : 'rgba(156, 163, 175, 0.1)',
                          borderColor:
                            rawProfileData.nominee_kyc_status === 'approved' || rawProfileData.nominee_kyc_status === 'verified'
                              ? 'rgba(34, 197, 94, 0.3)'
                              : rawProfileData.nominee_kyc_status === 'pending'
                                ? 'rgba(251, 191, 36, 0.3)'
                                : rawProfileData.nominee_kyc_status === 'rejected'
                                  ? 'rgba(239, 68, 68, 0.3)'
                                  : 'rgba(156, 163, 175, 0.3)',
                        }}>
                          <p className="text-sm font-medium">
                            Nominee KYC Status: <span className="capitalize">{rawProfileData.nominee_kyc_status}</span>
                          </p>
                          {rawProfileData.nominee_kyc_status === 'pending' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Your nominee KYC is under review. Please wait for verification.
                            </p>
                          )}
                          {rawProfileData.nominee_kyc_status === 'approved' || rawProfileData.nominee_kyc_status === 'verified' ? (
                            <p className="text-xs text-muted-foreground mt-1">
                              Your nominee KYC has been verified successfully.
                            </p>
                          ) : rawProfileData.nominee_kyc_status === 'rejected' ? (
                            <p className="text-xs text-muted-foreground mt-1">
                              Your nominee KYC was rejected. Please contact support for more information.
                            </p>
                          ) : null}
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              )}
            </>
          )}
          {activeTab === "addresses" && <Addresses />}
          {activeTab === "redemption" && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="p-4 sm:p-6 bg-primary/10 border border-primary/30 rounded-xl mb-4 sm:mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Available Points
                      </p>
                      <p className="text-2xl sm:text-4xl font-bold text-primary">
                        {user?.preBookingInfo?.redemptionPoints?.toLocaleString() ||
                          "0"}
                      </p>
                    </div>
                    <Gift className="w-8 h-8 sm:w-12 sm:h-12 text-primary/50" />
                  </div>
                </div>
                <Link to="/redemption">
                  <Button className="w-full">Browse Redemption Shop</Button>
                </Link>
              </CardContent>
            </Card>
          )}
          {activeTab === "settings" && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mobile</label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange("mobile", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profile Picture <span className="text-muted-foreground text-xs">(Optional - JPEG, PNG, GIF, WEBP, max 5MB)</span></label>
                    {profilePicturePreview && (
                      <div className="mb-2 flex items-center gap-4">
                        <img
                          src={profilePicturePreview}
                          alt="Profile preview"
                          className="w-24 h-24 rounded-full object-cover border-2 border-border"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Current Profile Picture</p>
                          {profilePicture && (
                            <p className="text-xs text-muted-foreground">
                              New: {profilePicture.name} ({(profilePicture.size / 1024).toFixed(2)} KB)
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {profilePicture 
                              ? profilePicture.name 
                              : profilePicturePreview
                                ? "Click to change profile picture"
                                : "Click to upload profile picture"}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                      </label>
                      {profilePicture && (
                        <p className="text-xs text-muted-foreground">
                          Selected: {profilePicture.name} ({(profilePicture.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address Line 1</label>
                    <input
                      type="text"
                      value={formData.address_line1}
                      onChange={(e) => handleInputChange("address_line1", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={formData.address_line2}
                      onChange={(e) => handleInputChange("address_line2", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pincode</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Country (Optional)</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  
                  {/* Referral Link Section */}
                  {profileData?.referral_link && (
                    <div className="space-y-2 pt-4 border-t border-border">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Your Referral Link
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={profileData.referral_link}
                            readOnly
                            className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-muted text-sm sm:text-base font-mono cursor-text"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              navigator.clipboard.writeText(profileData.referral_link || '');
                              toast.success('Referral link copied to clipboard!');
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                            title="Copy referral link"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Share this link with friends and family to earn referral bonuses
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto" 
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          {isDistributor && activeTab === "distributor" && (
            <DistributorOptions />
          )}
        </div>
      </div>
    </div>
  );
}
