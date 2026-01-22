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
  email?: string; // User email from API
  username?: string; // User username from API
  pv: number;
  joinedAt: string;
  referredBy: string; // Referral code of the distributor
}

// Side member node structure (used in both array and paginated formats)
export interface SideMemberNode {
  node_id: number;
  user_id: number;
  user_email: string;
  user_username: string;
  user_full_name: string;
  user_mobile: string;
  user_first_name: string;
  user_last_name: string;
  user_city: string;
  user_state: string;
  is_distributor: boolean;
  is_active_buyer: boolean;
  referral_code: string;
  date_joined: string;
  wallet_balance: string;
  total_bookings: number;
  total_binary_pairs: number;
  total_earnings: string;
  parent: number | null;
  side: 'left' | 'right' | null;
  level: number;
  left_count: number;
  right_count: number;
  created_at: string;
  updated_at: string;
}

// Paginated response structure for side members
export interface PaginatedSideMembers {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: SideMemberNode[];
}

// API response structure for tree structure node
export interface TreeNodeResponse {
  id?: number; // Some responses use 'id' instead of 'node_id' for root
  node_id: number;
  user_id: number;
  user_email: string;
  user_username: string;
  user_full_name: string;
  user_mobile: string;
  user_first_name: string;
  user_last_name: string;
  user_city: string;
  user_state: string;
  is_distributor: boolean;
  is_active_buyer: boolean;
  referral_code: string;
  date_joined: string;
  wallet_balance: string;
  total_bookings: number;
  total_binary_pairs: number;
  total_earnings: string;
  total_referrals: number;
  total_amount: string;
  tds_current: string;
  net_amount_total: string;
  parent: number | null;
  side: 'left' | 'right' | null;
  level: number;
  left_count: number;
  right_count: number;
  binary_commission_activated: boolean;
  activation_timestamp: string | null;
  left_child: TreeNodeResponse | null;
  right_child: TreeNodeResponse | null;
  // Can be either array (backward compatibility) or paginated object
  left_side_members: SideMemberNode[] | PaginatedSideMembers | null;
  right_side_members: SideMemberNode[] | PaginatedSideMembers | null;
  created_at: string;
  updated_at: string;
  pending_users?: Array<{
    user_id: number;
    user_email: string;
    user_username: string;
    user_full_name: string;
    has_node: boolean;
    node_id: number | null;
    in_tree: boolean;
  }>;
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

// Helper function to transform API TreeNodeResponse to BinaryNode
function transformTreeNodeToBinaryNode(node: TreeNodeResponse | null, position: 'left' | 'right' | 'root' = 'root'): BinaryNode | null {
  if (!node) {
    console.log(`transformTreeNodeToBinaryNode: Node is null for position ${position}`);
    return null;
  }

  console.log(`transformTreeNodeToBinaryNode: Transforming node ${node.node_id} (${node.user_full_name}), position: ${position}`);
  console.log(`transformTreeNodeToBinaryNode: Left child exists: ${!!node.left_child}, Right child exists: ${!!node.right_child}`);

  const transformed: BinaryNode = {
    id: `node-${node.node_id}`,
    name: node.user_full_name || node.user_username || node.user_email,
    position: position,
    pv: parseFloat(node.total_amount) || 0,
    joinedAt: node.date_joined,
    isActive: node.is_active_buyer,
    userId: node.user_id.toString(),
    children: {
      left: transformTreeNodeToBinaryNode(node.left_child, 'left'),
      right: transformTreeNodeToBinaryNode(node.right_child, 'right'),
    },
  };

  console.log(`transformTreeNodeToBinaryNode: Transformed node ${node.node_id}:`, transformed);
  return transformed;
}

export const binaryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBinaryTree: builder.query<BinaryNode, string>({
      query: () => ({
        url: 'binary/nodes/tree_structure/',
        method: 'GET',
      }),
      transformResponse: (response: TreeNodeResponse): BinaryNode => {
        // Log the API response
        console.log('Tree Structure API Response:', response);
        console.log('Tree Structure API Response - left_child:', response.left_child);
        console.log('Tree Structure API Response - right_child:', response.right_child);
        
        // Transform the root node
        const leftChild = transformTreeNodeToBinaryNode(response.left_child, 'left');
        const rightChild = transformTreeNodeToBinaryNode(response.right_child, 'right');
        
        console.log('Transformed left child:', leftChild);
        console.log('Transformed right child:', rightChild);
        
        const rootNode: BinaryNode = {
          id: `node-${response.node_id}`,
          name: response.user_full_name || response.user_username || response.user_email,
          position: 'root',
          pv: parseFloat(response.total_amount) || 0,
          joinedAt: response.date_joined,
          isActive: response.is_active_buyer,
          userId: response.user_id.toString(),
          children: {
            left: leftChild,
            right: rightChild,
          },
        };
        
        console.log('Final root node:', rootNode);
        return rootNode;
      },
      providesTags: (result, error, distributorId) => [{ type: 'Binary', id: distributorId }],
    }),
    // Get full tree structure with side members
    getTreeStructure: builder.query<
      TreeNodeResponse,
      {
        distributorId: string;
        side?: 'left' | 'right' | 'both';
        page?: number;
        page_size?: number;
        min_depth?: number;
        max_depth?: number;
      }
    >({
      query: ({ side, page, page_size, min_depth, max_depth }) => {
        const params = new URLSearchParams();
        if (side) params.append('side', side);
        if (page !== undefined && page !== null) params.append('page', page.toString());
        if (page_size !== undefined && page_size !== null) params.append('page_size', page_size.toString());
        if (min_depth !== undefined && min_depth !== null) params.append('min_depth', min_depth.toString());
        if (max_depth !== undefined && max_depth !== null) params.append('max_depth', max_depth.toString());
        
        const queryString = params.toString();
        const url = queryString 
          ? `binary/nodes/tree_structure/?${queryString}`
          : 'binary/nodes/tree_structure/';
        
        return {
          url,
          method: 'GET',
        };
      },
      // Serialize query args to ensure proper caching for different filter combinations
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { distributorId, side, page, page_size, min_depth, max_depth } = queryArgs;
        return `${endpointName}(${JSON.stringify({ 
          distributorId, 
          side: side || 'both', 
          page: page || 1, 
          page_size: page_size || 20,
          min_depth: min_depth ?? undefined,
          max_depth: max_depth ?? undefined
        })})`;
      },
      providesTags: (result, error, args) => [
        { type: 'Binary', id: args.distributorId },
        { type: 'Binary', id: `${args.distributorId}-${args.side || 'both'}-${args.page || 1}` },
      ],
    }),
    getPendingNodes: builder.query<PendingNode[], string>({
      query: () => ({
        url: 'binary/nodes/tree_structure/',
        method: 'GET',
      }),
      transformResponse: (response: TreeNodeResponse): PendingNode[] => {
        // Extract pending_users from the response
        const pendingUsers = response.pending_users || [];
        // Transform API response to PendingNode format
        return pendingUsers.map((user) => ({
          id: `pending-${user.user_id}`,
          userId: user.user_id.toString(),
          name: user.user_full_name || user.user_username || user.user_email,
          email: user.user_email,
          username: user.user_username,
          pv: 0, // PV not provided in API response, defaulting to 0
          joinedAt: new Date().toISOString(), // Joined date not provided in API response
          referredBy: '', // Referral code not provided in API response
        }));
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
      query: () => ({
        url: 'binary/nodes/tree_structure/',
        method: 'GET',
      }),
      transformResponse: (response: TreeNodeResponse): BinaryStats => {
        // Use actual data from API response
        const leftCount = response.left_count || 0;
        const rightCount = response.right_count || 0;
        const totalReferrals = response.total_referrals || 0;
        const totalPairs = response.total_binary_pairs || 0;
        const binaryActivated = response.binary_commission_activated || false;
        const totalEarnings = parseFloat(response.total_earnings) || 0;
        const tdsDeducted = parseFloat(response.tds_current) || 0;
        const netAmountTotal = parseFloat(response.net_amount_total) || 0;
        
        // Calculate total PV for left and right sides from tree structure
        function calculateTotalPV(node: TreeNodeResponse | null): number {
          if (!node) return 0;
          let total = parseFloat(node.total_amount) || 0;
          if (node.left_child) {
            total += calculateTotalPV(node.left_child);
          }
          if (node.right_child) {
            total += calculateTotalPV(node.right_child);
          }
          return total;
        }
        
        const totalLeftPV = response.left_child ? calculateTotalPV(response.left_child) : 0;
        const totalRightPV = response.right_child ? calculateTotalPV(response.right_child) : 0;
        
        // Calculate pairs beyond limit (if total pairs > 10)
        const pairsBeyondLimit = Math.max(0, totalPairs - MAX_PAIRS);
        
        // Activation bonus (if activated and has activation timestamp)
        const activationBonus = binaryActivated && response.activation_timestamp ? ACTIVATION_BONUS : 0;
        
        const stats: BinaryStats = {
          totalLeftPV: totalLeftPV,
          totalRightPV: totalRightPV,
          totalPairs: Math.min(totalPairs, MAX_PAIRS), // Cap at max pairs
          maxPairs: MAX_PAIRS,
          monthlyEarnings: netAmountTotal,
          totalEarnings: totalEarnings,
          tdsDeducted: tdsDeducted,
          poolMoney: 0, // Pool money calculation may need separate endpoint
          ceilingAmount: 0,
          ceilingUsed: 0,
          ceilingLimit: MAX_COMMISSION,
          binaryActivated: binaryActivated,
          leftCount: leftCount,
          rightCount: rightCount,
          totalReferrals: totalReferrals,
          activationBonus: activationBonus,
          pairsBeyondLimit: pairsBeyondLimit,
        };
        
        console.log('Binary Stats from API:', stats);
        
        return stats;
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
      query: ({ userId, parentId, side }) => {
        // Extract numeric IDs from string IDs
        // parentId format: "node-101" (from transformTreeNodeToBinaryNode)
        // userId format: string number
        const targetUserId = parseInt(userId, 10);
        let parentNodeId: number;
        
        // Extract numeric node_id from parentId string
        // Format is "node-{numeric_id}" based on transformTreeNodeToBinaryNode
        if (parentId.startsWith('node-')) {
          const numericPart = parentId.replace('node-', '');
          parentNodeId = parseInt(numericPart, 10);
          if (isNaN(parentNodeId)) {
            console.error('❌ [PLACE_USER API] Failed to extract parent_node_id from:', parentId);
            parentNodeId = 0;
          }
        } else {
          // Try to parse as number directly (fallback)
          parentNodeId = parseInt(parentId, 10);
          if (isNaN(parentNodeId)) {
            console.error('❌ [PLACE_USER API] Invalid parentId format:', parentId);
            parentNodeId = 0;
          }
        }
        
        // Prepare request body matching the API specification
        const body = {
          target_user_id: targetUserId,
          parent_node_id: parentNodeId,
          side: side, // "left" or "right"
          // allow_replacement: false // Optional, default: false (commented out as per API spec)
        };
        
        // Console log the request body
        console.log('🔵 [PLACE_USER API] Request Body:', JSON.stringify(body, null, 2));
        console.log('🔵 [PLACE_USER API] Extracted IDs:', {
          targetUserId,
          parentNodeId,
          originalParentId: parentId,
          side,
        });
        
        return {
          url: 'binary/nodes/place_user/',
          method: 'POST',
          body: body,
        };
      },
      transformResponse: (response: any) => {
        // Console log the response
        console.log('🟢 [PLACE_USER API] Response:', JSON.stringify(response, null, 2));
        console.log('🟢 [PLACE_USER API] Response Type:', typeof response);
        console.log('🟢 [PLACE_USER API] Response Keys:', Object.keys(response || {}));
        
        return {
          success: true,
          message: response.message || response.detail || 'User positioned successfully',
        };
      },
      transformErrorResponse: (response: any) => {
        // Console log the error response
        console.log('🔴 [PLACE_USER API] Error Response:', JSON.stringify(response, null, 2));
        console.log('🔴 [PLACE_USER API] Error Status:', response.status);
        console.log('🔴 [PLACE_USER API] Error Data:', response.data);
        
        return {
          status: response.status || 'ERROR',
          data: response.data || response.message || response.detail || 'Failed to position user',
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
    autoPlacePending: builder.mutation<any, void>({
      query: () => ({
        url: 'binary/nodes/auto_place_pending/',
        method: 'POST',
      }),
      invalidatesTags: (result, error) => [
        { type: 'PendingNodes' },
        { type: 'Binary' },
        { type: 'BinaryStats' },
      ],
    }),
    checkPairs: builder.mutation<any, void>({
      query: () => ({
        url: 'binary/pairs/check_pairs/',
        method: 'POST',
      }),
      invalidatesTags: (result, error) => [
        { type: 'Binary' },
        { type: 'BinaryStats' },
      ],
    }),
  }),
});

export const { 
  useGetBinaryTreeQuery,
  useGetTreeStructureQuery,
  useGetPendingNodesQuery,
  useGetPairHistoryQuery, 
  useGetBinaryStatsQuery, 
  useAddReferralMutation,
  useAddReferralNodeMutation,
  usePositionPendingNodeMutation,
  useMoveNodeMutation,
  useAutoPlacePendingMutation,
  useCheckPairsMutation,
} = binaryApi;
