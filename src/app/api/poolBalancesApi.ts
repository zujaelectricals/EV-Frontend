import { api } from './baseApi';
import { PoolWithdrawalRequest } from './poolWithdrawalApi';

export interface DistributorPoolBalance {
  distributorId: string;
  distributorName: string;
  email: string;
  phone: string;
  poolBalance: number;
  totalWithdrawals: number;
  totalWithdrawalAmount: number;
  lastWithdrawalDate?: string;
  status: 'active' | 'inactive';
  joinedAt?: string;
  totalPairs?: number;
  totalEarnings?: number;
}

export interface DistributorPoolDetails extends DistributorPoolBalance {
  withdrawalHistory: PoolWithdrawalRequest[];
  poolMoneyHistory: Array<{
    date: string;
    amount: number;
    type: 'earned' | 'withdrawn' | 'transferred';
    description: string;
  }>;
}

// Helper function to get all distributors from localStorage
function getAllDistributors(): Array<{
  id: string;
  name: string;
  email: string;
  phone?: string;
  isDistributor: boolean;
  distributorInfo?: {
    isVerified?: boolean;
    poolMoney?: number;
    joinedAt?: string;
    totalPairs?: number;
    totalEarnings?: number;
  };
}> {
  if (typeof window === 'undefined') return [];
  
  const distributors: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    isDistributor: boolean;
    distributorInfo?: {
      isVerified?: boolean;
      poolMoney?: number;
      joinedAt?: string;
      totalPairs?: number;
      totalEarnings?: number;
    };
  }> = [];

  try {
    // Get from multiple accounts storage
    const accountsKey = 'ev_nexus_multiple_accounts';
    const storedAccounts = localStorage.getItem(accountsKey);
    if (storedAccounts) {
      const accounts = JSON.parse(storedAccounts);
      accounts.forEach((acc: any) => {
        if (acc.user && acc.user.isDistributor && acc.user.distributorInfo?.isVerified) {
          distributors.push({
            id: acc.user.id,
            name: acc.user.name,
            email: acc.user.email,
            phone: acc.user.phone,
            isDistributor: acc.user.isDistributor,
            distributorInfo: acc.user.distributorInfo,
          });
        }
      });
    }

    // Also check current auth storage
    const authDataStr = localStorage.getItem('ev_nexus_auth_data');
    if (authDataStr) {
      const authData = JSON.parse(authDataStr);
      if (authData.user && authData.user.isDistributor && authData.user.distributorInfo?.isVerified) {
        const exists = distributors.find(d => d.id === authData.user.id);
        if (!exists) {
          distributors.push({
            id: authData.user.id,
            name: authData.user.name,
            email: authData.user.email,
            phone: authData.user.phone,
            isDistributor: authData.user.isDistributor,
            distributorInfo: authData.user.distributorInfo,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error reading distributors from localStorage:', error);
  }

  return distributors;
}

// Helper function to get withdrawal requests
function getWithdrawalRequests(): PoolWithdrawalRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('ev_nexus_pool_withdrawal_requests');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading withdrawal requests:', error);
    return [];
  }
}

export const poolBalancesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all distributor pool balances
    getAllPoolBalances: builder.query<DistributorPoolBalance[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        
        const distributors = getAllDistributors();
        const withdrawalRequests = getWithdrawalRequests();
        
        const balances: DistributorPoolBalance[] = distributors.map((dist) => {
          const userWithdrawals = withdrawalRequests.filter(
            req => req.userId === dist.id || req.distributorId === dist.id
          );
          const approvedWithdrawals = userWithdrawals.filter(req => req.status === 'approved');
          const totalWithdrawalAmount = approvedWithdrawals.reduce((sum, req) => sum + req.amount, 0);
          
          const lastWithdrawal = approvedWithdrawals
            .sort((a, b) => new Date(b.processedAt || b.requestedAt).getTime() - new Date(a.processedAt || a.requestedAt).getTime())[0];

          return {
            distributorId: dist.id,
            distributorName: dist.name,
            email: dist.email,
            phone: dist.phone || 'N/A',
            poolBalance: dist.distributorInfo?.poolMoney || 0,
            totalWithdrawals: approvedWithdrawals.length,
            totalWithdrawalAmount,
            lastWithdrawalDate: lastWithdrawal?.processedAt || lastWithdrawal?.requestedAt,
            status: (dist.distributorInfo?.poolMoney || 0) > 0 ? 'active' : 'inactive',
            joinedAt: dist.distributorInfo?.joinedAt,
            totalPairs: dist.distributorInfo?.totalPairs || 0,
            totalEarnings: dist.distributorInfo?.totalEarnings || 0,
          };
        });

        // Sort by pool balance (highest first)
        balances.sort((a, b) => b.poolBalance - a.poolBalance);

        return { data: balances };
      },
      providesTags: ['PoolBalances'],
    }),

    // Get detailed pool information for a specific distributor
    getDistributorPoolDetails: builder.query<DistributorPoolDetails, string>({
      queryFn: async (distributorId: string) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        
        const distributors = getAllDistributors();
        const distributor = distributors.find(d => d.id === distributorId);
        
        if (!distributor) {
          return {
            error: { status: 'NOT_FOUND', data: 'Distributor not found' },
          };
        }

        const withdrawalRequests = getWithdrawalRequests();
        const userWithdrawals = withdrawalRequests.filter(
          req => req.userId === distributorId || req.distributorId === distributorId
        );
        const approvedWithdrawals = userWithdrawals.filter(req => req.status === 'approved');
        const totalWithdrawalAmount = approvedWithdrawals.reduce((sum, req) => sum + req.amount, 0);
        
        const lastWithdrawal = approvedWithdrawals
          .sort((a, b) => new Date(b.processedAt || b.requestedAt).getTime() - new Date(a.processedAt || a.requestedAt).getTime())[0];

        // Build pool money history (simplified - in real app, this would track all changes)
        const poolMoneyHistory: Array<{
          date: string;
          amount: number;
          type: 'earned' | 'withdrawn' | 'transferred';
          description: string;
        }> = [];

        // Add withdrawal history entries
        approvedWithdrawals.forEach((req) => {
          poolMoneyHistory.push({
            date: req.processedAt || req.requestedAt,
            amount: req.amount,
            type: 'withdrawn',
            description: `Withdrawal: ${req.reason}`,
          });
        });

        // Sort history by date (newest first)
        poolMoneyHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const details: DistributorPoolDetails = {
          distributorId: distributor.id,
          distributorName: distributor.name,
          email: distributor.email,
          phone: distributor.phone || 'N/A',
          poolBalance: distributor.distributorInfo?.poolMoney || 0,
          totalWithdrawals: approvedWithdrawals.length,
          totalWithdrawalAmount,
          lastWithdrawalDate: lastWithdrawal?.processedAt || lastWithdrawal?.requestedAt,
          status: (distributor.distributorInfo?.poolMoney || 0) > 0 ? 'active' : 'inactive',
          joinedAt: distributor.distributorInfo?.joinedAt,
          totalPairs: distributor.distributorInfo?.totalPairs || 0,
          totalEarnings: distributor.distributorInfo?.totalEarnings || 0,
          withdrawalHistory: userWithdrawals.sort(
            (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
          ),
          poolMoneyHistory,
        };

        return { data: details };
      },
      providesTags: (result, error, distributorId) => [{ type: 'PoolBalances', id: distributorId }],
    }),
  }),
});

export const {
  useGetAllPoolBalancesQuery,
  useGetDistributorPoolDetailsQuery,
} = poolBalancesApi;

