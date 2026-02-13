import { useState, useEffect } from 'react';
import { User, Users, LogOut, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setCredentials, User as UserType } from '@/app/slices/authSlice';
import { loadBookingsForUser } from '@/app/slices/bookingSlice';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Add styles for hover states
const profileSwitcherStyles = `
  button[data-highlighted] .profile-switcher-text,
  [role="menuitem"][data-highlighted] .profile-switcher-text {
    color: hsl(var(--accent-foreground)) !important;
  }
  button[data-highlighted] .profile-switcher-text-muted,
  [role="menuitem"][data-highlighted] .profile-switcher-text-muted {
    color: hsl(var(--accent-foreground) / 0.85) !important;
  }
`;

const STORAGE_KEY = 'ev_nexus_multiple_accounts';

interface StoredAccount {
  user: UserType;
  token: string;
  lastUsed: string;
}

export const ProfileSwitcher = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.auth);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);

  // Note: Multiple accounts feature removed - accounts are managed in Redux state only
  useEffect(() => {
    // Clear any old multiple accounts data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Note: Multiple accounts feature removed - only tokens are stored in localStorage
  // User data is managed in Redux state only

  const switchAccount = (account: StoredAccount) => {
    try {
      // Always reload the user data from the stored accounts list first (it should have latest data)
      // Then also check localStorage as a fallback
      let updatedUser = account.user;
      let updatedToken = account.token;
      
      // First, check the stored accounts list (which should be updated by approval)
      try {
        const accountsKey = 'ev_nexus_multiple_accounts';
        const storedAccounts = localStorage.getItem(accountsKey);
        if (storedAccounts) {
          const accounts = JSON.parse(storedAccounts);
          const matchingAccount = accounts.find((acc: StoredAccount) => 
            acc.user && (
              acc.user.id === account.user.id || 
              acc.user.email === account.user.email ||
              account.user.id?.startsWith(acc.user.id) ||
              acc.user.id?.startsWith(account.user.id)
            )
          );
          
          if (matchingAccount && matchingAccount.user) {
            updatedUser = matchingAccount.user; // Use the latest user data from stored accounts
            updatedToken = matchingAccount.token || account.token;
            console.log('Switching to account with updated data:', {
              userId: updatedUser.id,
              isDistributor: updatedUser.isDistributor,
              isVerified: updatedUser.distributorInfo?.isVerified,
              verificationStatus: updatedUser.distributorInfo?.verificationStatus
            });
          } else {
            console.log('No matching account found in stored accounts, using provided account data');
          }
        }
      } catch (e) {
        console.warn('Could not reload from stored accounts:', e);
      }
      
      // Load KYC status from localStorage
      try {
        const KYC_STORAGE_KEY = 'ev_nexus_kyc_data';
        const kycDataStr = localStorage.getItem(KYC_STORAGE_KEY);
        if (kycDataStr) {
          const kycData = JSON.parse(kycDataStr);
          const userKYC = kycData[updatedUser.id];
          if (userKYC) {
            updatedUser = {
              ...updatedUser,
              kycStatus: userKYC.kycStatus,
              kycDetails: userKYC.kycDetails,
            };
          } else {
            updatedUser = {
              ...updatedUser,
              kycStatus: 'not_submitted',
            };
          }
        } else {
          updatedUser = {
            ...updatedUser,
            kycStatus: 'not_submitted',
          };
        }
      } catch (e) {
        console.warn('Could not load KYC status:', e);
      }
      
      // Also check current auth storage as a fallback
      try {
        const authDataStr = localStorage.getItem('ev_nexus_auth_data');
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          // If this is the account we're switching to, use the latest data from localStorage
          if (authData.user && (authData.user.id === account.user.id || 
              authData.user.email === account.user.email ||
              account.user.id?.startsWith(authData.user.id) ||
              authData.user.id?.startsWith(account.user.id))) {
            // Merge KYC status and distributor info from auth storage
            if (authData.user.kycStatus) {
              updatedUser = {
                ...updatedUser,
                kycStatus: authData.user.kycStatus,
                kycDetails: authData.user.kycDetails,
              };
            }
            // Only use this if it's more recent or has distributor info we don't have
            if (!updatedUser.distributorInfo?.isVerified && authData.user.distributorInfo?.isVerified) {
              updatedUser = { ...updatedUser, ...authData.user }; // Merge all user data
              updatedToken = authData.token || account.token;
            }
          }
        }
      } catch (e) {
        console.warn('Could not reload user data from auth storage:', e);
      }

      // Update Redux state with the latest user data
      dispatch(setCredentials({ user: updatedUser, token: updatedToken }));
      // Load bookings for the switched user
      dispatch(loadBookingsForUser(updatedUser.id));
      
      // Update the stored account with latest data and last used time
      // Reload accounts from localStorage to ensure we have the latest data
      try {
        const accountsKey = 'ev_nexus_multiple_accounts';
        const storedAccounts = localStorage.getItem(accountsKey);
        if (storedAccounts) {
          const currentAccounts = JSON.parse(storedAccounts);
          const updatedAccounts = currentAccounts.map((acc: StoredAccount) =>
            acc.user && (acc.user.id === account.user.id || 
              acc.user.email === account.user.email ||
              account.user.id?.startsWith(acc.user.id) ||
              acc.user.id?.startsWith(account.user.id))
              ? { ...acc, lastUsed: new Date().toISOString(), user: updatedUser, token: updatedToken }
              : acc
          );
          localStorage.setItem(accountsKey, JSON.stringify(updatedAccounts));
          setAccounts(updatedAccounts);
          // Also reload to ensure we have the latest
          loadAccounts();
        }
      } catch (e) {
        console.warn('Could not update stored accounts:', e);
      }

      // Navigate based on role
      let redirectPath = '/';
      if (updatedUser.role === 'admin') {
        redirectPath = '/admin';
      } else if (updatedUser.role === 'staff') {
        redirectPath = '/staff/leads';
      } else if (updatedUser.isDistributor && updatedUser.distributorInfo?.isVerified) {
        redirectPath = '/distributor';
      } else {
        redirectPath = '/profile';
      }

      // Force a page reload to ensure all components refresh with new user data
      navigate(redirectPath);
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
      toast.success(`Switched to ${updatedUser.name}`);
    } catch (error) {
      console.error('Error switching account:', error);
      toast.error('Failed to switch account');
    }
  };

  const getRoleBadge = (role: string, isDistributor: boolean) => {
    if (role === 'admin') {
      return <Badge className="bg-red-500 text-white text-xs">Admin</Badge>;
    } else if (role === 'staff') {
      return <Badge className="bg-blue-500 text-white text-xs">Staff</Badge>;
    } else if (isDistributor) {
      return <Badge className="bg-pink-500 text-white text-xs">Distributor</Badge>;
    }
    return <Badge className="bg-gray-500 text-white text-xs">User</Badge>;
  };

  const otherAccounts = accounts.filter(acc => acc.user.id !== user?.id);

  return (
    <>
      <style>{profileSwitcherStyles}</style>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Switch Profile</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch Profile</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Current Account */}
        {user && (
          <>
            <DropdownMenuItem disabled className="opacity-100">
              <div className="flex items-center gap-2 w-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                  <span className="text-xs font-medium text-primary">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                {getRoleBadge(user.role, user.isDistributor || false)}
              </div>
            </DropdownMenuItem>
            <div className="text-xs text-muted-foreground px-2 py-1">Current</div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Other Accounts */}
        {otherAccounts.length > 0 ? (
          <>
            <DropdownMenuLabel className="text-xs">Other Accounts</DropdownMenuLabel>
            {otherAccounts.map((account) => (
              <DropdownMenuItem
                key={account.user.id}
                onClick={() => switchAccount(account)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    <span className="text-xs font-medium profile-switcher-text">
                      {account.user.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate profile-switcher-text">{account.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate profile-switcher-text-muted">{account.user.email}</p>
                  </div>
                  {getRoleBadge(account.user.role, account.user.isDistributor || false)}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        ) : (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No other accounts available
            <p className="text-xs mt-1">Login with different accounts to switch</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
};

