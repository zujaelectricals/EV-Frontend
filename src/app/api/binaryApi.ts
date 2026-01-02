import { api } from './baseApi';
import { BinaryPair } from '@/app/slices/binarySlice';

export interface BinaryNode {
  id: string;
  name: string;
  position: 'left' | 'right' | 'root';
  pv: number;
  joinedAt: string;
  isActive: boolean;
  children: {
    left: BinaryNode | null;
    right: BinaryNode | null;
  };
}

export interface PairMatch {
  id: string;
  leftUserId: string;
  rightUserId: string;
  leftPV: number;
  rightPV: number;
  matchedPV: number;
  commission: number;
  tds: number;
  netAmount: number;
  poolMoney: number;
  matchedAt: string;
}

export interface BinaryStats {
  totalLeftPV: number;
  totalRightPV: number;
  totalPairs: number;
  maxPairs: number; // 10 pairs max
  monthlyEarnings: number;
  totalEarnings: number;
  tdsDeducted: number;
  poolMoney: number;
  ceilingAmount: number; // 20% of total earnings
  ceilingUsed: number;
  ceilingLimit: number; // Max ₹20,000
  binaryActivated: boolean;
  leftCount: number;
  rightCount: number;
  totalReferrals: number;
}

const COMMISSION_PER_PAIR = 2000;
const MAX_PAIRS = 10;
const TDS_RATE = 0.1; // 10%
const POOL_MONEY_RATE = 0.2; // 20%
const BINARY_ACTIVATION_REQUIREMENT = 3; // 3 referrals needed

const mockBinaryTree: BinaryNode = {
  id: 'root',
  name: 'You',
  position: 'root',
  pv: 5000,
  joinedAt: '2024-01-01',
  isActive: true,
  children: {
    left: {
      id: 'l1',
      name: 'Amit Kumar',
      position: 'left',
      pv: 5000,
      joinedAt: '2024-02-15',
      isActive: true,
      children: {
        left: {
          id: 'l1l',
          name: 'Priya Singh',
          position: 'left',
          pv: 5000,
          joinedAt: '2024-03-10',
          isActive: true,
          children: { left: null, right: null },
        },
        right: {
          id: 'l1r',
          name: 'Rahul Sharma',
          position: 'right',
          pv: 5000,
          joinedAt: '2024-03-20',
          isActive: true,
          children: { left: null, right: null },
        },
      },
    },
    right: {
      id: 'r1',
      name: 'Sneha Patel',
      position: 'right',
      pv: 5000,
      joinedAt: '2024-02-20',
      isActive: true,
      children: {
        left: {
          id: 'r1l',
          name: 'Vikram Reddy',
          position: 'left',
          pv: 5000,
          joinedAt: '2024-04-05',
          isActive: true,
          children: { left: null, right: null },
        },
        right: {
          id: 'r1r',
          name: 'Anita Desai',
          position: 'right',
          pv: 5000,
          joinedAt: '2024-04-15',
          isActive: true,
          children: { left: null, right: null },
        },
      },
    },
  },
};

// Calculate pairs from binary tree
function calculatePairs(node: BinaryNode | null, side: 'left' | 'right'): number {
  if (!node) return 0;
  if (!node.children.left && !node.children.right) return 1;
  return calculatePairs(node.children.left, 'left') + calculatePairs(node.children.right, 'right');
}

function countReferrals(node: BinaryNode | null): { left: number; right: number; total: number } {
  if (!node) return { left: 0, right: 0, total: 0 };
  
  const leftCount = countReferrals(node.children.left).total + (node.children.left ? 1 : 0);
  const rightCount = countReferrals(node.children.right).total + (node.children.right ? 1 : 0);
  
  return {
    left: leftCount,
    right: rightCount,
    total: leftCount + rightCount,
  };
}

const referrals = countReferrals(mockBinaryTree);
const leftCount = referrals.left;
const rightCount = referrals.right;
const totalReferrals = referrals.total;
const binaryActivated = totalReferrals >= BINARY_ACTIVATION_REQUIREMENT;

// Calculate pairs (minimum of left and right)
const totalPairs = Math.min(leftCount, rightCount);
const cappedPairs = Math.min(totalPairs, MAX_PAIRS);

// Calculate earnings
const totalEarnings = cappedPairs * COMMISSION_PER_PAIR;
const tdsDeducted = totalEarnings * TDS_RATE;
const poolMoney = Math.min(totalEarnings * POOL_MONEY_RATE, 4000); // Max ₹4000
const netEarnings = totalEarnings - tdsDeducted - poolMoney;
const ceilingAmount = Math.min(totalEarnings * 0.2, 20000); // 20% max ₹20,000

const mockPairHistory: PairMatch[] = Array.from({ length: cappedPairs }, (_, i) => ({
  id: `pair-${i + 1}`,
  leftUserId: `left-${i + 1}`,
  rightUserId: `right-${i + 1}`,
  leftPV: 5000,
  rightPV: 5000,
  matchedPV: 5000,
  commission: COMMISSION_PER_PAIR,
  tds: COMMISSION_PER_PAIR * TDS_RATE,
  netAmount: COMMISSION_PER_PAIR * (1 - TDS_RATE - POOL_MONEY_RATE),
  poolMoney: COMMISSION_PER_PAIR * POOL_MONEY_RATE,
  matchedAt: new Date(Date.now() - (cappedPairs - i) * 86400000).toISOString(),
}));

const mockStats: BinaryStats = {
  totalLeftPV: leftCount * 5000,
  totalRightPV: rightCount * 5000,
  totalPairs: cappedPairs,
  maxPairs: MAX_PAIRS,
  monthlyEarnings: netEarnings,
  totalEarnings: totalEarnings,
  tdsDeducted: tdsDeducted,
  poolMoney: poolMoney,
  ceilingAmount: ceilingAmount,
  ceilingUsed: 0,
  ceilingLimit: 20000,
  binaryActivated: binaryActivated,
  leftCount: leftCount,
  rightCount: rightCount,
  totalReferrals: totalReferrals,
};

export const binaryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBinaryTree: builder.query<BinaryNode, void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: mockBinaryTree };
      },
      providesTags: ['Binary'],
    }),
    getPairHistory: builder.query<PairMatch[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { data: mockPairHistory };
      },
    }),
    getBinaryStats: builder.query<BinaryStats, void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { data: mockStats };
      },
    }),
    addReferral: builder.mutation<{ success: boolean; message: string }, { userId: string; side: 'left' | 'right' }>({
      queryFn: async ({ userId, side }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // In real implementation, this would add a referral and check for pair matching
        return { 
          data: { 
            success: true, 
            message: `Referral added to ${side} side. Binary commission will be calculated automatically.` 
          } 
        };
      },
      invalidatesTags: ['Binary'],
    }),
  }),
});

export const { useGetBinaryTreeQuery, useGetPairHistoryQuery, useGetBinaryStatsQuery, useAddReferralMutation } = binaryApi;
