import { api } from './baseApi';

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
  leftPV: number;
  rightPV: number;
  matchedPV: number;
  bonus: number;
  carryForward: { left: number; right: number };
  matchedAt: string;
}

export interface BinaryStats {
  totalLeftPV: number;
  totalRightPV: number;
  totalPairs: number;
  monthlyEarnings: number;
  ceilingUsed: number;
  ceilingLimit: number;
}

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
      pv: 2500,
      joinedAt: '2024-02-15',
      isActive: true,
      children: {
        left: {
          id: 'l1l',
          name: 'Priya Singh',
          position: 'left',
          pv: 1200,
          joinedAt: '2024-03-10',
          isActive: true,
          children: { left: null, right: null },
        },
        right: {
          id: 'l1r',
          name: 'Rahul Sharma',
          position: 'right',
          pv: 800,
          joinedAt: '2024-03-20',
          isActive: false,
          children: { left: null, right: null },
        },
      },
    },
    right: {
      id: 'r1',
      name: 'Sneha Patel',
      position: 'right',
      pv: 3000,
      joinedAt: '2024-02-20',
      isActive: true,
      children: {
        left: {
          id: 'r1l',
          name: 'Vikram Reddy',
          position: 'left',
          pv: 1500,
          joinedAt: '2024-04-05',
          isActive: true,
          children: { left: null, right: null },
        },
        right: {
          id: 'r1r',
          name: 'Anita Desai',
          position: 'right',
          pv: 2000,
          joinedAt: '2024-04-15',
          isActive: true,
          children: { left: null, right: null },
        },
      },
    },
  },
};

const mockPairHistory: PairMatch[] = [
  { id: '1', leftPV: 2500, rightPV: 3000, matchedPV: 2500, bonus: 2500, carryForward: { left: 0, right: 500 }, matchedAt: '2024-12-20' },
  { id: '2', leftPV: 1800, rightPV: 2200, matchedPV: 1800, bonus: 1800, carryForward: { left: 0, right: 400 }, matchedAt: '2024-12-15' },
  { id: '3', leftPV: 3200, rightPV: 2800, matchedPV: 2800, bonus: 2800, carryForward: { left: 400, right: 0 }, matchedAt: '2024-12-10' },
];

const mockStats: BinaryStats = {
  totalLeftPV: 4500,
  totalRightPV: 6500,
  totalPairs: 45,
  monthlyEarnings: 35000,
  ceilingUsed: 35000,
  ceilingLimit: 100000,
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
  }),
});

export const { useGetBinaryTreeQuery, useGetPairHistoryQuery, useGetBinaryStatsQuery } = binaryApi;
