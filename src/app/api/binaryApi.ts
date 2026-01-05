import { api } from './baseApi';
import { BinaryPair } from '@/app/slices/binarySlice';

export interface BinaryNode {
  id: string;
  name: string;
  position: 'left' | 'right' | 'root';
  pv: number;
  joinedAt: string;
  isActive: boolean;
  userId?: string; // User ID to identify the actual user
  children: {
    left: BinaryNode | null;
    right: BinaryNode | null;
  };
}

export interface PendingNode {
  id: string;
  userId: string;
  name: string;
  pv: number;
  joinedAt: string;
  referredBy: string; // Referral code of the distributor
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
  ceilingAmount: number; // 20% of total earnings (deprecated, kept for compatibility)
  ceilingUsed: number;
  ceilingLimit: number; // Max ₹20,000
  binaryActivated: boolean;
  leftCount: number;
  rightCount: number;
  totalReferrals: number;
  activationBonus?: number; // ₹2000 activation bonus
  pairsBeyondLimit?: number; // Pairs tracked but not earning commission
}

const COMMISSION_PER_PAIR = 2000;
const MAX_PAIRS = 10;
const MAX_COMMISSION = 20000; // ₹20,000 maximum commission
const TDS_RATE = 0.1; // 10%
const POOL_MONEY_AT_LIMIT = 4000; // ₹4,000 (20% of ₹20,000) added when reaching limit
const ACTIVATION_BONUS = 2000; // ₹2,000 activation bonus
const REFERRAL_COMMISSION = 1000; // ₹1,000 per referral (only before activation)
const BINARY_ACTIVATION_REQUIREMENT = 3; // 3 users (not pairs) needed

// localStorage keys
const BINARY_TREE_STORAGE_KEY = 'ev_nexus_binary_trees';
const PENDING_NODES_STORAGE_KEY = 'ev_nexus_pending_nodes';
const PAIR_COUNT_STORAGE_KEY = 'ev_nexus_pair_counts'; // Track pair counts per distributor

// Helper function to find distributor ID by referral code
function findDistributorIdByReferralCode(referralCode: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const accountsKey = 'ev_nexus_multiple_accounts';
    const stored = localStorage.getItem(accountsKey);
    if (stored) {
      const accounts = JSON.parse(stored);
      const distributor = accounts.find((acc: any) => 
        acc.user?.distributorInfo?.referralCode === referralCode &&
        acc.user?.distributorInfo?.isDistributor === true &&
        acc.user?.distributorInfo?.isVerified === true
      );
      if (distributor?.user?.id) {
        return distributor.user.id;
      }
    }
  } catch (error) {
    console.error('Error finding distributor by referral code:', error);
  }
  return null;
}

// Helper functions for localStorage
function getBinaryTreesFromStorage(): Record<string, BinaryNode> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(BINARY_TREE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading binary trees from localStorage:', error);
    return {};
  }
}

function saveBinaryTreeToStorage(distributorId: string, tree: BinaryNode): void {
  if (typeof window === 'undefined') return;
  try {
    const trees = getBinaryTreesFromStorage();
    trees[distributorId] = tree;
    localStorage.setItem(BINARY_TREE_STORAGE_KEY, JSON.stringify(trees));
  } catch (error) {
    console.error('Error saving binary tree to localStorage:', error);
  }
}

function getPendingNodesFromStorage(): Record<string, PendingNode[]> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(PENDING_NODES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading pending nodes from localStorage:', error);
    return {};
  }
}

function savePendingNodesToStorage(distributorId: string, nodes: PendingNode[]): void {
  if (typeof window === 'undefined') return;
  try {
    const pendingNodes = getPendingNodesFromStorage();
    pendingNodes[distributorId] = nodes;
    localStorage.setItem(PENDING_NODES_STORAGE_KEY, JSON.stringify(pendingNodes));
  } catch (error) {
    console.error('Error saving pending nodes to localStorage:', error);
  }
}

function addPendingNode(distributorId: string, node: PendingNode): void {
  const pendingNodes = getPendingNodesFromStorage();
  if (!pendingNodes[distributorId]) {
    pendingNodes[distributorId] = [];
  }
  // Check if node already exists
  if (!pendingNodes[distributorId].find(n => n.userId === node.userId)) {
    pendingNodes[distributorId].push(node);
    savePendingNodesToStorage(distributorId, pendingNodes[distributorId]);
  }
}

function removePendingNode(distributorId: string, userId: string): void {
  const pendingNodes = getPendingNodesFromStorage();
  if (pendingNodes[distributorId]) {
    pendingNodes[distributorId] = pendingNodes[distributorId].filter(n => n.userId !== userId);
    savePendingNodesToStorage(distributorId, pendingNodes[distributorId]);
  }
}

// Get stored pair count for a distributor
function getStoredPairCount(distributorId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(PAIR_COUNT_STORAGE_KEY);
    if (stored) {
      const counts = JSON.parse(stored);
      return counts[distributorId] || 0;
    }
  } catch (error) {
    console.error('Error reading pair counts from localStorage:', error);
  }
  return 0;
}

// Save pair count for a distributor
function savePairCount(distributorId: string, count: number): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(PAIR_COUNT_STORAGE_KEY);
    const counts = stored ? JSON.parse(stored) : {};
    counts[distributorId] = count;
    localStorage.setItem(PAIR_COUNT_STORAGE_KEY, JSON.stringify(counts));
  } catch (error) {
    console.error('Error saving pair count to localStorage:', error);
  }
}

// Helper function to update user's distributorInfo in localStorage
function updateDistributorInfoInStorage(distributorId: string, updates: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    const authDataStr = localStorage.getItem('ev_nexus_auth_data');
    if (authDataStr) {
      const authData = JSON.parse(authDataStr);
      if (authData.user && (authData.user.id === distributorId || 
          authData.user.id?.startsWith(distributorId) || 
          distributorId.startsWith(authData.user.id))) {
        
        // Initialize distributorInfo if needed
        if (!authData.user.distributorInfo) {
          authData.user.distributorInfo = {
            isDistributor: true,
            isVerified: true,
            verificationStatus: 'approved',
            referralCode: '',
            leftCount: 0,
            rightCount: 0,
            totalReferrals: 0,
            binaryActivated: false,
            activationBonusCredited: false,
            totalCommissionEarned: 0,
            pairsBeyondLimit: 0,
            poolMoney: 0,
            pairsAtActivation: 0, // Track pairs count when binary was activated
            joinedAt: new Date().toISOString(),
          };
        }
        
        // Apply updates
        authData.user.distributorInfo = { ...authData.user.distributorInfo, ...updates };
        
        // Also update in profile switcher accounts
        try {
          const accountsKey = 'ev_nexus_multiple_accounts';
          const storedAccounts = localStorage.getItem(accountsKey);
          if (storedAccounts) {
            const accounts = JSON.parse(storedAccounts);
            const updatedAccounts = accounts.map((acc: any) => {
              if (acc.user && (acc.user.id === distributorId || 
                  acc.user.id?.startsWith(distributorId) || 
                  distributorId.startsWith(acc.user.id))) {
                return {
                  ...acc,
                  user: {
                    ...acc.user,
                    distributorInfo: {
                      ...acc.user.distributorInfo,
                      ...updates,
                    },
                  },
                };
              }
              return acc;
            });
            localStorage.setItem(accountsKey, JSON.stringify(updatedAccounts));
          }
        } catch (accountError) {
          console.warn('Could not update distributor info in profile switcher accounts:', accountError);
        }
        
        localStorage.setItem('ev_nexus_auth_data', JSON.stringify(authData));
      }
    }
  } catch (error) {
    console.error('Error updating distributor info:', error);
  }
}

// Credit activation bonus when 3rd referral is added
function creditActivationBonus(distributorId: string): void {
  try {
    const authDataStr = localStorage.getItem('ev_nexus_auth_data');
    if (authDataStr) {
      const authData = JSON.parse(authDataStr);
      if (authData.user && authData.user.distributorInfo) {
        if (!authData.user.distributorInfo.activationBonusCredited) {
          updateDistributorInfoInStorage(distributorId, {
            activationBonusCredited: true,
            binaryActivated: true,
          });
          console.log(`Activation bonus of ₹${ACTIVATION_BONUS} credited for distributor ${distributorId}`);
        }
      }
    }
  } catch (error) {
    console.error('Error crediting activation bonus:', error);
  }
}

// Update pool money when reaching 10 pairs or ₹20,000 commission
function updatePoolMoneyAtLimit(distributorId: string, totalCommission: number, pairCount: number): void {
  try {
    const authDataStr = localStorage.getItem('ev_nexus_auth_data');
    if (authDataStr) {
      const authData = JSON.parse(authDataStr);
      if (authData.user && authData.user.distributorInfo) {
        const currentPoolMoney = authData.user.distributorInfo.poolMoney || 0;
        const hasReachedLimit = (pairCount >= MAX_PAIRS || totalCommission >= MAX_COMMISSION);
        
        // Only add pool money once when limit is reached
        if (hasReachedLimit && currentPoolMoney < POOL_MONEY_AT_LIMIT) {
          updateDistributorInfoInStorage(distributorId, {
            poolMoney: POOL_MONEY_AT_LIMIT,
          });
          console.log(`Added ₹${POOL_MONEY_AT_LIMIT} to pool money for reaching limit (${pairCount} pairs, ₹${totalCommission} commission)`);
        }
      }
    }
  } catch (error) {
    console.error('Error updating pool money at limit:', error);
  }
}

// Find the first available position in the tree (first null child)
function findFirstAvailablePosition(node: BinaryNode, depth: number = 0, maxDepth: number = 10): { parentId: string; side: 'left' | 'right' } | null {
  if (depth > maxDepth) return null;
  
  // Check left child
  if (!node.children.left) {
    return { parentId: node.id, side: 'left' };
  }
  
  // Check right child
  if (!node.children.right) {
    return { parentId: node.id, side: 'right' };
  }
  
  // Recursively check children
  const leftResult = findFirstAvailablePosition(node.children.left, depth + 1, maxDepth);
  if (leftResult) return leftResult;
  
  const rightResult = findFirstAvailablePosition(node.children.right, depth + 1, maxDepth);
  if (rightResult) return rightResult;
  
  return null;
}

// Add node to tree at specified position
function addNodeToTree(tree: BinaryNode, newNode: BinaryNode, parentId: string, side: 'left' | 'right'): BinaryNode {
  function addNodeRecursive(node: BinaryNode): BinaryNode {
    if (node.id === parentId) {
      return {
        ...node,
        children: {
          ...node.children,
          [side]: newNode,
        },
      };
    }
    
    return {
      ...node,
      children: {
        left: node.children.left ? addNodeRecursive(node.children.left) : null,
        right: node.children.right ? addNodeRecursive(node.children.right) : null,
      },
    };
  }
  
  return addNodeRecursive(tree);
}

// Find parent node of a given node
function findParentNode(tree: BinaryNode, nodeId: string, parent: BinaryNode | null = null): { parent: BinaryNode | null; side: 'left' | 'right' | null } | null {
  if (tree.children.left?.id === nodeId) {
    return { parent: tree, side: 'left' };
  }
  if (tree.children.right?.id === nodeId) {
    return { parent: tree, side: 'right' };
  }
  
  if (tree.children.left) {
    const result = findParentNode(tree.children.left, nodeId, tree);
    if (result) return result;
  }
  
  if (tree.children.right) {
    const result = findParentNode(tree.children.right, nodeId, tree);
    if (result) return result;
  }
  
  return null;
}

// Swap two sibling nodes (same parent, left and right)
function swapSiblingNodes(tree: BinaryNode, nodeId: string, newParentId: string, newSide: 'left' | 'right'): BinaryNode {
  // Find the parent and side of the node being moved
  const sourceParentInfo = findParentNode(tree, nodeId);
  if (!sourceParentInfo || !sourceParentInfo.parent || !sourceParentInfo.side) {
    console.error('Source parent not found for node swap');
    return tree;
  }
  
  const sourceParent = sourceParentInfo.parent;
  const sourceSide = sourceParentInfo.side;
  
  // Check if we're swapping siblings (same parent, opposite sides)
  if (sourceParent.id !== newParentId) {
    console.error('Cannot swap: nodes are not siblings');
    return tree;
  }
  
  // If trying to swap with the same side, no change needed
  if (sourceSide === newSide) {
    return tree;
  }
  
  // Perform the swap
  function swapRecursive(node: BinaryNode): BinaryNode {
    if (node.id === newParentId) {
      const leftChild = node.children.left;
      const rightChild = node.children.right;
      
      // Swap the children
      return {
        ...node,
        children: {
          left: rightChild ? { ...rightChild, position: 'left' } : null,
          right: leftChild ? { ...leftChild, position: 'right' } : null,
        },
      };
    }
    
    return {
      ...node,
      children: {
        left: node.children.left ? swapRecursive(node.children.left) : null,
        right: node.children.right ? swapRecursive(node.children.right) : null,
      },
    };
  }
  
  return swapRecursive(tree);
}

// Move node in tree (for drag and drop)
function moveNodeInTree(tree: BinaryNode, nodeId: string, newParentId: string, newSide: 'left' | 'right'): BinaryNode {
  // First, remove the node from its current position
  function removeNodeRecursive(node: BinaryNode): { node: BinaryNode; removedNode: BinaryNode | null } {
    if (node.children.left?.id === nodeId) {
      const removedNode = node.children.left;
      return {
        node: { ...node, children: { ...node.children, left: null } },
        removedNode,
      };
    }
    if (node.children.right?.id === nodeId) {
      const removedNode = node.children.right;
      return {
        node: { ...node, children: { ...node.children, right: null } },
        removedNode,
      };
    }
    
    if (node.children.left) {
      const leftResult = removeNodeRecursive(node.children.left);
      if (leftResult.removedNode) {
        return {
          node: { ...node, children: { ...node.children, left: leftResult.node } },
          removedNode: leftResult.removedNode,
        };
      }
    }
    
    if (node.children.right) {
      const rightResult = removeNodeRecursive(node.children.right);
      if (rightResult.removedNode) {
        return {
          node: { ...node, children: { ...node.children, right: rightResult.node } },
          removedNode: rightResult.removedNode,
        };
      }
    }
    
    return { node, removedNode: null };
  }
  
  const { node: treeWithoutNode, removedNode } = removeNodeRecursive(tree);
  
  if (!removedNode) {
    console.error('Node not found in tree');
    return tree;
  }
  
  // Now add the node at the new position
  const updatedNode = { ...removedNode, position: newSide };
  return addNodeToTree(treeWithoutNode, updatedNode, newParentId, newSide);
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

// Calculate earnings (mock data - using old calculation for compatibility)
const totalEarnings = cappedPairs * COMMISSION_PER_PAIR;
const tdsDeducted = totalEarnings * TDS_RATE;
// Mock pool money - in real system, it's ₹4000 when limit is reached
const poolMoney = cappedPairs >= MAX_PAIRS ? POOL_MONEY_AT_LIMIT : 0;
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
  // Net amount after TDS (pool money is added separately when limit is reached)
  netAmount: COMMISSION_PER_PAIR * (1 - TDS_RATE),
  poolMoney: 0, // Pool money is 0 per pair, only ₹4000 when limit reached
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
    getBinaryTree: builder.query<BinaryNode, string>({
      queryFn: async (distributorId: string) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const trees = getBinaryTreesFromStorage();
        let tree = trees[distributorId];
        
        if (tree) {
          return { data: tree };
        }
        
        // Initialize tree if it doesn't exist (use current user as root or mock data)
        try {
          const authData = localStorage.getItem('ev_nexus_auth_data');
          if (authData) {
            const parsed = JSON.parse(authData);
            const user = parsed.user;
            if (user && user.id === distributorId) {
              // Create tree with user as root
              tree = {
                id: `root-${distributorId}`,
                name: user.name || 'You',
                position: 'root',
                pv: user.preBookingInfo?.preBookingAmount || 5000,
                joinedAt: user.joinedAt || new Date().toISOString(),
                isActive: true,
                userId: user.id,
                children: { left: null, right: null },
              };
              // Save to storage
              saveBinaryTreeToStorage(distributorId, tree);
              return { data: tree };
            }
          }
        } catch (e) {
          console.error('Error initializing tree from user data:', e);
        }
        
        // Fallback to mock tree and save it
        tree = {
          ...mockBinaryTree,
          id: `root-${distributorId}`,
        };
        saveBinaryTreeToStorage(distributorId, tree);
        return { data: tree };
      },
      providesTags: (result, error, distributorId) => [{ type: 'Binary', id: distributorId }],
    }),
    getPendingNodes: builder.query<PendingNode[], string>({
      queryFn: async (distributorId: string) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const pendingNodes = getPendingNodesFromStorage();
        return { data: pendingNodes[distributorId] || [] };
      },
      providesTags: (result, error, distributorId) => [{ type: 'PendingNodes', id: distributorId }],
    }),
    getPairHistory: builder.query<PairMatch[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { data: mockPairHistory };
      },
    }),
    getBinaryStats: builder.query<BinaryStats, string>({
      queryFn: async (distributorId: string) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const trees = getBinaryTreesFromStorage();
        let tree = trees[distributorId];
        
        // If tree doesn't exist, try to get it the same way getBinaryTree does
        if (!tree) {
          try {
            const authData = localStorage.getItem('ev_nexus_auth_data');
            if (authData) {
              const parsed = JSON.parse(authData);
              const user = parsed.user;
              if (user && user.id === distributorId) {
                tree = {
                  id: `root-${distributorId}`,
                  name: user.name || 'You',
                  position: 'root',
                  pv: user.preBookingInfo?.preBookingAmount || 5000,
                  joinedAt: user.joinedAt || new Date().toISOString(),
                  isActive: true,
                  userId: user.id,
                  children: { left: null, right: null },
                };
              }
            }
          } catch (e) {
            console.error('Error getting tree for stats:', e);
          }
          
          if (!tree) {
            tree = {
              ...mockBinaryTree,
              id: `root-${distributorId}`,
            };
          }
        }
        
        // Calculate stats from the actual tree
        const referrals = countReferrals(tree);
        const leftCount = referrals.left;
        const rightCount = referrals.right;
        const totalReferrals = referrals.total;
        
        // Binary activates when 3 users (not pairs) are added
        const binaryActivated = totalReferrals >= BINARY_ACTIVATION_REQUIREMENT;
        
        // Calculate total pairs (minimum of left and right)
        const totalPairs = Math.min(leftCount, rightCount);
        
        // Get distributor info to check activation status and track commission
        let distributorInfo: any = null;
        try {
          const authDataStr = localStorage.getItem('ev_nexus_auth_data');
          if (authDataStr) {
            const authData = JSON.parse(authDataStr);
            if (authData.user && authData.user.distributorInfo && 
                (authData.user.id === distributorId || 
                 authData.user.id?.startsWith(distributorId) || 
                 distributorId.startsWith(authData.user.id))) {
              distributorInfo = authData.user.distributorInfo;
            }
          }
        } catch (e) {
          console.warn('Could not get distributor info:', e);
        }
        
        const wasActivatedBefore = distributorInfo?.binaryActivated || false;
        const isActivated = wasActivatedBefore || binaryActivated;
        const previousCommissionEarned = distributorInfo?.totalCommissionEarned || 0;
        let pairsAtActivation = distributorInfo?.pairsAtActivation || 0;
        
        console.log('Before Setting pairsAtActivation:', {
          binaryActivated,
          wasActivatedBefore,
          totalPairs,
          currentPairsAtActivation: pairsAtActivation,
          distributorInfoPairsAtActivation: distributorInfo?.pairsAtActivation,
        });
        
        // Set pairsAtActivation ONLY when binary FIRST activates (transition from not activated to activated)
        // This must be done BEFORE calculating pair commission
        if (binaryActivated && !wasActivatedBefore) {
          // Binary just activated - set pairsAtActivation to current pair count
          if (pairsAtActivation === 0) {
            pairsAtActivation = totalPairs;
            console.log('Setting pairsAtActivation to:', totalPairs);
            // Update it immediately so subsequent calculations use the correct value
            updateDistributorInfoInStorage(distributorId, {
              pairsAtActivation: totalPairs,
              binaryActivated: true,
            });
          }
          // Credit activation bonus
          creditActivationBonus(distributorId);
        }
        
        // Fix for existing accounts: If pairsAtActivation is incorrectly set
        // When binary first activates (at 3rd referral), there can only be 1 pair maximum
        // (min of left and right counts when 3rd referral is added)
        // If pairsAtActivation > 1, it means it was incorrectly set when all referrals were already added
        if (isActivated && pairsAtActivation > 1) {
          // Check if this account was activated with 3 referrals
          // If pairsAtActivation equals totalPairs and totalPairs > 1, it's likely incorrect
          // The correct value should be 1 (the pair count when 3rd referral was added)
          if (pairsAtActivation === totalPairs && totalPairs > 1) {
            console.log('Fixing incorrect pairsAtActivation:', pairsAtActivation, '-> 1 (should be pair count at activation, not current total)');
            pairsAtActivation = 1;
            updateDistributorInfoInStorage(distributorId, {
              pairsAtActivation: 1,
            });
          }
        }
        
        console.log('After Setting pairsAtActivation:', {
          pairsAtActivation,
          totalPairs,
          expectedPairsAfterActivation: totalPairs - pairsAtActivation,
        });
        
        // Calculate referral commission (₹1,000 per referral, only for first 3 referrals before activation)
        const referralCommissionEarned = Math.min(totalReferrals, BINARY_ACTIVATION_REQUIREMENT) * REFERRAL_COMMISSION;
        
        // Calculate pair commission (only for pairs added AFTER activation)
        let pairCommissionEarned = 0;
        let pairsEarningCommission = 0;
        let pairsBeyondLimit = 0;
        
        if (isActivated) {
          // Pairs that were formed at or before activation don't earn commission
          // Only pairs added AFTER activation earn commission
          const pairsAfterActivation = Math.max(0, totalPairs - pairsAtActivation);
          
          console.log('Pair Commission Calculation Debug:', {
            totalPairs,
            pairsAtActivation,
            calculatedPairsAfterActivation: pairsAfterActivation,
            expectedPairsAfterActivation: totalPairs - pairsAtActivation,
          });
          
          // Calculate how many pairs can earn commission (up to 10 pairs or ₹20,000)
          const maxCommissionPairs = Math.floor(MAX_COMMISSION / COMMISSION_PER_PAIR); // 10 pairs
          
          // Pairs earning commission = pairs after activation (capped at max)
          pairsEarningCommission = Math.min(pairsAfterActivation, maxCommissionPairs);
          
          // Calculate commission based on pairs after activation ONLY
          // Always recalculate from current state, don't use previous stored values
          pairCommissionEarned = pairsEarningCommission * COMMISSION_PER_PAIR;
          
          // Track pairs beyond limit (for carry forward) - only count pairs after activation
          pairsBeyondLimit = Math.max(0, pairsAfterActivation - maxCommissionPairs);
          
          // Total commission = referral commission + pair commission
          const totalCommissionEarned = referralCommissionEarned + pairCommissionEarned;
          
          // Update distributor info with new commission and pair counts
          updateDistributorInfoInStorage(distributorId, {
            leftCount,
            rightCount,
            totalReferrals,
            binaryActivated: isActivated,
            totalCommissionEarned: totalCommissionEarned,
            pairsBeyondLimit,
            pairsAtActivation, // Ensure it's persisted
          });
          
          // Update pool money when reaching limit (based on pair commission only)
          updatePoolMoneyAtLimit(distributorId, pairCommissionEarned, pairsEarningCommission);
        } else {
          // Before activation: only referral commission
          const totalCommissionEarned = referralCommissionEarned;
          
          // Update distributor info with new commission and pair counts
          updateDistributorInfoInStorage(distributorId, {
            leftCount,
            rightCount,
            totalReferrals,
            binaryActivated: false,
            totalCommissionEarned: totalCommissionEarned,
          });
        }
        
        // Calculate TDS on total commission (referral + pair)
        const totalCommissionEarned = referralCommissionEarned + pairCommissionEarned;
        const tdsDeducted = totalCommissionEarned * TDS_RATE;
        
        // Get actual pool money (₹4000 when limit is reached, otherwise 0)
        let actualPoolMoney = 0;
        try {
          const authDataStr = localStorage.getItem('ev_nexus_auth_data');
          if (authDataStr) {
            const authData = JSON.parse(authDataStr);
            if (authData.user && authData.user.distributorInfo && 
                (authData.user.id === distributorId || 
                 authData.user.id?.startsWith(distributorId) || 
                 distributorId.startsWith(authData.user.id))) {
              actualPoolMoney = authData.user.distributorInfo.poolMoney || 0;
            }
          }
        } catch (e) {
          console.warn('Could not get actual pool money:', e);
        }
        
        const netEarnings = totalCommissionEarned - tdsDeducted - actualPoolMoney;
        
        // Calculate total PV for left and right sides
        function calculateTotalPV(node: BinaryNode | null): number {
          if (!node) return 0;
          let total = node.pv || 0;
          if (node.children.left) {
            total += calculateTotalPV(node.children.left);
          }
          if (node.children.right) {
            total += calculateTotalPV(node.children.right);
          }
          return total;
        }
        
        const totalLeftPV = tree.children.left ? calculateTotalPV(tree.children.left) : 0;
        const totalRightPV = tree.children.right ? calculateTotalPV(tree.children.right) : 0;
        
        // Get activation bonus status
        const activationBonusCredited = distributorInfo?.activationBonusCredited || false;
        const activationBonus = activationBonusCredited && isActivated ? ACTIVATION_BONUS : 0;
        
        // Total earnings = referral commission (first 3) + activation bonus + pair commission
        const totalEarningsWithBonus = referralCommissionEarned + activationBonus + pairCommissionEarned;
        
        const stats: BinaryStats = {
          totalLeftPV: totalLeftPV,
          totalRightPV: totalRightPV,
          totalPairs: pairsEarningCommission, // Only show pairs earning commission
          maxPairs: MAX_PAIRS,
          monthlyEarnings: netEarnings,
          totalEarnings: totalEarningsWithBonus, // Referral commission + activation bonus + pair commission
          tdsDeducted: tdsDeducted,
          poolMoney: actualPoolMoney,
          ceilingAmount: 0, // Not used in new system
          ceilingUsed: 0,
          ceilingLimit: MAX_COMMISSION,
          binaryActivated: isActivated,
          leftCount: leftCount,
          rightCount: rightCount,
          totalReferrals: totalReferrals,
          activationBonus: activationBonus,
          pairsBeyondLimit: pairsBeyondLimit,
        };
        
        console.log('Binary Stats Calculated:', {
          treeId: tree.id,
          leftCount,
          rightCount,
          totalPairs,
          pairsAtActivation,
          pairsAfterActivation: totalPairs - pairsAtActivation,
          pairsEarningCommission,
          pairsBeyondLimit,
          referralCommissionEarned,
          pairCommissionEarned,
          activationBonus,
          totalEarnings: totalEarningsWithBonus,
          totalLeftPV,
          totalRightPV,
          isActivated,
          wasActivatedBefore,
        });
        
        return { data: stats };
      },
      providesTags: (result, error, distributorId) => [{ type: 'BinaryStats', id: distributorId }],
    }),
    addReferralNode: builder.mutation<
      { success: boolean; message: string },
      { distributorId: string; userId: string; userName: string; pv: number; referralCode: string }
    >({
      queryFn: async ({ distributorId, userId, userName, pv, referralCode }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Get or create tree
        const trees = getBinaryTreesFromStorage();
        let tree = trees[distributorId];
        
        if (!tree) {
          // Initialize tree if it doesn't exist
          try {
            const authData = localStorage.getItem('ev_nexus_auth_data');
            if (authData) {
              const parsed = JSON.parse(authData);
              const user = parsed.user;
              if (user && user.id === distributorId) {
                tree = {
                  id: `root-${distributorId}`,
                  name: user.name || 'You',
                  position: 'root',
                  pv: user.preBookingInfo?.preBookingAmount || 5000,
                  joinedAt: user.joinedAt || new Date().toISOString(),
                  isActive: true,
                  userId: user.id,
                  children: { left: null, right: null },
                };
              }
            }
          } catch (e) {
            console.error('Error initializing tree:', e);
          }
          
          if (!tree) {
            // Fallback: create a basic root node
            tree = {
              id: `root-${distributorId}`,
              name: 'You',
              position: 'root',
              pv: 5000,
              joinedAt: new Date().toISOString(),
              isActive: true,
              userId: distributorId,
              children: { left: null, right: null },
            };
          }
        }
        
        // Always add new users to pending nodes - distributor will manually position them
        const pendingNode: PendingNode = {
          id: `pending-${userId}`,
          userId,
          name: userName,
          pv,
          joinedAt: new Date().toISOString(),
          referredBy: referralCode,
        };
        
        addPendingNode(distributorId, pendingNode);
        
        return {
          data: {
            success: true,
            message: `User ${userName} has been added to pending list. Please manually position them in your team network.`,
          },
        };
      },
      invalidatesTags: (result, error, { distributorId }) => [
        { type: 'PendingNodes', id: distributorId },
        { type: 'Binary', id: distributorId },
        { type: 'BinaryStats', id: distributorId },
      ],
    }),
    positionPendingNode: builder.mutation<
      { success: boolean; message: string },
      { distributorId: string; userId: string; parentId: string; side: 'left' | 'right' }
    >({
      queryFn: async ({ distributorId, userId, parentId, side }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Get pending node
        const pendingNodes = getPendingNodesFromStorage();
        const pendingNode = pendingNodes[distributorId]?.find(n => n.userId === userId);
        
        if (!pendingNode) {
          return {
            error: { status: 'NOT_FOUND', data: 'Pending node not found' },
          };
        }
        
        // Get tree from storage - it should exist from getBinaryTree
        const trees = getBinaryTreesFromStorage();
        let tree = trees[distributorId];
        
        // If tree doesn't exist, try to get it from getBinaryTree query result
        // This ensures we're working with the same tree structure that's displayed
        if (!tree) {
          // Try to initialize from user data first
          try {
            const authData = localStorage.getItem('ev_nexus_auth_data');
            if (authData) {
              const parsed = JSON.parse(authData);
              const user = parsed.user;
              if (user && user.id === distributorId) {
                tree = {
                  id: `root-${distributorId}`,
                  name: user.name || 'You',
                  position: 'root',
                  pv: user.preBookingInfo?.preBookingAmount || 5000,
                  joinedAt: user.joinedAt || new Date().toISOString(),
                  isActive: true,
                  userId: user.id,
                  children: { left: null, right: null },
                };
                saveBinaryTreeToStorage(distributorId, tree);
              }
            }
          } catch (e) {
            console.error('Error initializing tree:', e);
          }
          
          // Fallback to mock tree if still no tree
          if (!tree) {
            tree = {
              ...mockBinaryTree,
              id: `root-${distributorId}`,
            };
            saveBinaryTreeToStorage(distributorId, tree);
          }
        }
        
        // Create binary node from pending node
        const newNode: BinaryNode = {
          id: `node-${userId}`,
          name: pendingNode.name,
          position: side,
          pv: pendingNode.pv,
          joinedAt: pendingNode.joinedAt,
          isActive: true,
          userId: pendingNode.userId,
          children: { left: null, right: null },
        };
        
        // Check if parent position is available
        function findNodeById(node: BinaryNode, id: string): BinaryNode | null {
          if (node.id === id) return node;
          if (node.children.left) {
            const found = findNodeById(node.children.left, id);
            if (found) return found;
          }
          if (node.children.right) {
            const found = findNodeById(node.children.right, id);
            if (found) return found;
          }
          return null;
        }
        
        // Debug: Log tree structure and available node IDs
        function getAllNodeIds(node: BinaryNode): string[] {
          const ids = [node.id];
          if (node.children.left) {
            ids.push(...getAllNodeIds(node.children.left));
          }
          if (node.children.right) {
            ids.push(...getAllNodeIds(node.children.right));
          }
          return ids;
        }
        
        const allNodeIds = getAllNodeIds(tree);
        console.log('Available node IDs in tree:', allNodeIds);
        console.log('Looking for parent ID:', parentId);
        
        const parentNode = findNodeById(tree, parentId);
        if (!parentNode) {
          return {
            error: { 
              status: 'NOT_FOUND', 
              data: `Parent node with ID "${parentId}" not found. Available nodes: ${allNodeIds.join(', ')}. Please refresh the page and try again.` 
            },
          };
        }
        
        if (parentNode.children[side]) {
          return {
            error: { 
              status: 'CONFLICT', 
              data: `The ${side} position is already occupied by "${parentNode.children[side]?.name}". Please select a different position.` 
            },
          };
        }
        
        // Add node to tree
        tree = addNodeToTree(tree, newNode, parentId, side);
        saveBinaryTreeToStorage(distributorId, tree);
        
        // Remove from pending nodes
        removePendingNode(distributorId, userId);
        
        return {
          data: {
            success: true,
            message: `Node positioned on ${side} side successfully.`,
          },
        };
      },
      invalidatesTags: (result, error, { distributorId }) => [
        { type: 'PendingNodes', id: distributorId },
        { type: 'Binary', id: distributorId },
        { type: 'BinaryStats', id: distributorId },
      ],
    }),
    moveNode: builder.mutation<
      { success: boolean; message: string },
      { distributorId: string; nodeId: string; newParentId: string; newSide: 'left' | 'right' }
    >({
      queryFn: async ({ distributorId, nodeId, newParentId, newSide }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const trees = getBinaryTreesFromStorage();
        const tree = trees[distributorId];
        
        if (!tree) {
          return {
            error: { status: 'NOT_FOUND', data: 'Binary tree not found' },
          };
        }
        
        // Validate that new position is available
        function findNodeById(node: BinaryNode, id: string): BinaryNode | null {
          if (node.id === id) return node;
          if (node.children.left) {
            const found = findNodeById(node.children.left, id);
            if (found) return found;
          }
          if (node.children.right) {
            const found = findNodeById(node.children.right, id);
            if (found) return found;
          }
          return null;
        }
        
        const newParentNode = findNodeById(tree, newParentId);
        if (!newParentNode) {
          return {
            error: { status: 'NOT_FOUND', data: 'New parent node not found' },
          };
        }
        
        // Check if target position is occupied
        if (newParentNode.children[newSide]) {
          // Check if we're swapping siblings (same parent, opposite side)
          const sourceParentInfo = findParentNode(tree, nodeId);
          if (sourceParentInfo && sourceParentInfo.parent && sourceParentInfo.parent.id === newParentId) {
            // This is a sibling swap - swap the nodes
            const updatedTree = swapSiblingNodes(tree, nodeId, newParentId, newSide);
            saveBinaryTreeToStorage(distributorId, updatedTree);
            
            return {
              data: {
                success: true,
                message: 'Nodes swapped successfully.',
              },
            };
          } else {
            // Position is occupied by a non-sibling node
            return {
              error: { status: 'CONFLICT', data: `Position ${newSide} is already occupied` },
            };
          }
        }
        
        // Move node to empty position
        const updatedTree = moveNodeInTree(tree, nodeId, newParentId, newSide);
        saveBinaryTreeToStorage(distributorId, updatedTree);
        
        return {
          data: {
            success: true,
            message: 'Node moved successfully.',
          },
        };
      },
      invalidatesTags: (result, error, { distributorId }) => [
        { type: 'Binary', id: distributorId },
        { type: 'BinaryStats', id: distributorId },
      ],
    }),
    addReferral: builder.mutation<{ success: boolean; message: string }, { userId: string; side: 'left' | 'right' }>({
      queryFn: async ({ userId, side }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // In real implementation, this would add a referral and check for pair matching
        return { 
          data: { 
            success: true, 
            message: `Referral added to ${side === 'left' ? 'RSA' : 'RSB'}. Team commission will be calculated automatically.` 
          } 
        };
      },
      invalidatesTags: (result, error, { userId }) => ['Binary', 'BinaryStats'],
    }),
  }),
});

export const { 
  useGetBinaryTreeQuery, 
  useGetPendingNodesQuery,
  useGetPairHistoryQuery, 
  useGetBinaryStatsQuery, 
  useAddReferralMutation,
  useAddReferralNodeMutation,
  usePositionPendingNodeMutation,
  useMoveNodeMutation,
} = binaryApi;
