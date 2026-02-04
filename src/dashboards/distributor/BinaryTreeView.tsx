import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  Users,
  TrendingUp,
  Info,
  AlertCircle,
  RefreshCw,
  Activity,
  User,
  Network,
  Link2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppSelector } from "@/app/hooks";
import {
  useGetBinaryTreeQuery,
  useGetTreeStructureQuery,
  useGetBinaryStatsQuery,
  useGetPendingNodesQuery,
  usePositionPendingNodeMutation,
  useAutoPlacePendingMutation,
  useCheckPairsMutation,
  type BinaryNode,
  type PendingNode,
  type TreeNodeResponse,
  type PaginatedSideMembers,
  type SideMemberNode,
} from "@/app/api/binaryApi";
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { StatsCard } from "@/shared/components/StatsCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { BinaryTreeNode } from "@/binary/components/BinaryTreeNode";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface TeamMember {
  id: string;
  name: string;
  userId?: string;
  joinedAt: string;
  position: "left" | "right";
  pv: number;
  level: number;
  referrals: number;
  isActive: boolean;
  parentId?: string;
  parentName?: string;
  referralCode?: string;
}

// Helper function to extract team members from binary tree
function extractTeamMembers(
  node: BinaryNode | null,
  level = 0,
  position: "left" | "right" = "left",
  parentId?: string,
  parentName?: string,
  minDepth?: number,
  maxDepth?: number
): TeamMember[] {
  // Check depth limits
  if (minDepth !== undefined && level < minDepth) {
    // Continue traversing but don't include this level yet
  } else if (maxDepth !== undefined && level > maxDepth) {
    // Stop traversing beyond max depth
    return [];
  }

  if (!node || node.position === "root") {
    const members: TeamMember[] = [];
    if (node?.children.left) {
      members.push(
        ...extractTeamMembers(
          node.children.left,
          level + 1,
          "left",
          node.id,
          node.name,
          minDepth,
          maxDepth
        )
      );
    }
    if (node?.children.right) {
      members.push(
        ...extractTeamMembers(
          node.children.right,
          level + 1,
          "right",
          node.id,
          node.name,
          minDepth,
          maxDepth
        )
      );
    }
    return members;
  }

  const member: TeamMember = {
    id: node.id,
    name: node.name,
    userId: node.userId,
    joinedAt: node.joinedAt,
    position: position,
    pv: node.pv,
    level: level,
    referrals: countDescendants(node),
    isActive: node.isActive,
    parentId: parentId,
    parentName: parentName,
  };

  const members: TeamMember[] = [];
  
  // Only include member if it's within depth range
  if ((minDepth === undefined || level >= minDepth) && (maxDepth === undefined || level <= maxDepth)) {
    members.push(member);
  }

  if (node.children.left) {
    members.push(
      ...extractTeamMembers(
        node.children.left,
        level + 1,
        "left",
        node.id,
        node.name,
        minDepth,
        maxDepth
      )
    );
  }
  if (node.children.right) {
    members.push(
      ...extractTeamMembers(
        node.children.right,
        level + 1,
        "right",
        node.id,
        node.name,
        minDepth,
        maxDepth
      )
    );
  }

  return members;
}

function countDescendants(node: BinaryNode | null): number {
  if (!node) return 0;
  let count = 0;
  if (node.children.left) count += 1 + countDescendants(node.children.left);
  if (node.children.right) count += 1 + countDescendants(node.children.right);
  return count;
}

// Helper function to create a lookup map for parent names (fallback for backward compatibility)
// Note: The API now provides parent_name directly, but we keep this for cases where it might not be available
function createParentNameMap(treeStructure: TreeNodeResponse | undefined): Map<number, string> {
  const parentMap = new Map<number, string>();
  
  if (!treeStructure) return parentMap;
  
  // Add root node
  parentMap.set(treeStructure.node_id, treeStructure.user_full_name || treeStructure.user_username || 'Root');
  
  // Recursively add all nodes to the map
  function addNodeToMap(node: TreeNodeResponse | null) {
    if (!node) return;
    
    parentMap.set(node.node_id, node.user_full_name || node.user_username || node.user_email || 'Unknown');
    
    // When pagination is enabled, left_child and right_child only show direct children (no nested recursion)
    // So we only need to check direct children
    if (node.left_child) addNodeToMap(node.left_child);
    if (node.right_child) addNodeToMap(node.right_child);
  }
  
  if (treeStructure.left_child) addNodeToMap(treeStructure.left_child);
  if (treeStructure.right_child) addNodeToMap(treeStructure.right_child);
  
  return parentMap;
}

// Helper function to extract team members from side_members arrays and direct children
// Respects the API filtering - only extracts from what the API returns
function extractTeamMembersFromSideMembers(
  treeStructure: TreeNodeResponse | undefined,
  sideFilter: 'left' | 'right' | 'both' = 'both',
  minDepth?: number,
  maxDepth?: number
): TeamMember[] {
  if (!treeStructure) {
    return [];
  }

  const members: TeamMember[] = [];
  const parentNameMap = createParentNameMap(treeStructure);
  const processedNodeIds = new Set<number>(); // Track processed nodes to avoid duplicates

  // Helper function to convert TreeNodeResponse to TeamMember
  const nodeToMember = (node: TreeNodeResponse, position: 'left' | 'right', parentId?: number): TeamMember => {
    // Use parent_name from API response if available, otherwise fallback to map lookup
    const parentName = node.parent_name || (parentId ? parentNameMap.get(parentId) : undefined);
    return {
      id: `node-${node.node_id || node.id || node.user_id}`,
      name: node.user_full_name || node.user_username || node.user_email || 'Unknown',
      userId: node.user_id?.toString(),
      joinedAt: node.date_joined || node.created_at || new Date().toISOString(),
      position: position,
      pv: parseFloat(node.total_earnings || node.total_amount || '0'),
      level: node.level || 0,
      referrals: (node.left_count || 0) + (node.right_count || 0),
      isActive: node.is_active_buyer !== false,
      parentId: parentId ? `node-${parentId}` : undefined,
      parentName: parentName || undefined,
      referralCode: node.referral_code || undefined,
    };
  };

  // Helper function to extract direct children (left_child and right_child)
  // Note: When pagination is enabled, direct children don't have nested side_members
  // Nested descendants are accessible through paginated left_side_members and right_side_members
  const extractFromChild = (child: TreeNodeResponse | null, position: 'left' | 'right', rootNodeId: number, currentLevel: number = 1) => {
    if (!child) return;
    
    // Check depth limits
    if (minDepth !== undefined && currentLevel < minDepth) {
      // Continue but don't include this level yet
      return;
    } else if (maxDepth !== undefined && currentLevel > maxDepth) {
      // Stop traversing beyond max depth
      return;
    }
    
    // Only extract if this position matches the filter
    if (sideFilter !== 'both' && sideFilter !== position) return;
    
    const nodeId = child.node_id || child.id || child.user_id;
    if (processedNodeIds.has(nodeId)) return; // Avoid duplicates
    processedNodeIds.add(nodeId);
    
    // Only include member if it's within depth range
    if ((minDepth === undefined || currentLevel >= minDepth) && (maxDepth === undefined || currentLevel <= maxDepth)) {
      members.push(nodeToMember(child, position, rootNodeId));
    }
    
    // When pagination is enabled, we don't recursively extract from children
    // because nested descendants are in side_members (which are already paginated)
    // However, if pagination is not enabled (backward compatibility), we can still recurse
    // We check if side_members exist and are paginated - if so, don't recurse
    const hasPaginatedSideMembers = 
      (child.left_side_members && typeof child.left_side_members === 'object' && 'results' in child.left_side_members) ||
      (child.right_side_members && typeof child.right_side_members === 'object' && 'results' in child.right_side_members);
    
    // Only recursively process children if pagination is not enabled (backward compatibility)
    if (!hasPaginatedSideMembers) {
      if (child.left_child && (sideFilter === 'both' || sideFilter === 'left')) {
        extractFromChild(child.left_child, 'left', nodeId, currentLevel + 1);
      }
      if (child.right_child && (sideFilter === 'both' || sideFilter === 'right')) {
        extractFromChild(child.right_child, 'right', nodeId, currentLevel + 1);
      }
    }
  };

  // Helper function to extract members from either array or paginated format
  const extractMembers = (sideMembers: SideMemberNode[] | PaginatedSideMembers | null | undefined, position: 'left' | 'right') => {
    if (!sideMembers) return;
    
    // Only extract if this position matches the filter
    if (sideFilter !== 'both' && sideFilter !== position) return;

    let memberArray: SideMemberNode[] = [];
    
    // Check if it's a paginated response
    if (typeof sideMembers === 'object' && 'results' in sideMembers) {
      memberArray = sideMembers.results;
    } 
    // Check if it's an array
    else if (Array.isArray(sideMembers)) {
      memberArray = sideMembers;
    }

    memberArray.forEach((member: SideMemberNode) => {
      if (member) {
        // Additional safety check: ensure member's side matches filter
        if (sideFilter !== 'both' && member.side && member.side !== sideFilter) {
          return;
        }
        
        // Check depth limits
        const memberLevel = member.level || 0;
        if (minDepth !== undefined && memberLevel < minDepth) {
          return;
        }
        if (maxDepth !== undefined && memberLevel > maxDepth) {
          return;
        }
        
        const nodeId = member.node_id || member.user_id;
        // Skip if already processed
        if (processedNodeIds.has(nodeId)) return;
        processedNodeIds.add(nodeId);
        
        const parentId = member.parent;
        // Use parent_name from API response if available, otherwise fallback to map lookup
        const parentName = member.parent_name || (parentId ? parentNameMap.get(parentId) : undefined);
        
        members.push({
          id: `node-${nodeId}`,
          name: member.user_full_name || member.user_username || member.user_email || 'Unknown',
          userId: member.user_id?.toString(),
          joinedAt: member.date_joined || member.created_at || new Date().toISOString(),
          position: position,
          pv: parseFloat(member.total_earnings || '0'),
          level: memberLevel,
          referrals: (member.left_count || 0) + (member.right_count || 0), // Use counts from API
          isActive: member.is_active_buyer !== false,
          parentId: parentId ? `node-${parentId}` : undefined,
          parentName: parentName || undefined,
          referralCode: member.referral_code || undefined,
        });
      }
    });
  };

  const rootNodeId = treeStructure.node_id || treeStructure.id || treeStructure.user_id;

  // Extract direct children (left_child and right_child) based on filter
  // NOTE: Direct children are ALWAYS shown separately and are NOT included in side_members pagination
  // According to API docs: "Direct children are excluded from side_members count"
  // Start at level 1 (children of root are at level 1)
  let directChildrenCount = 0;
  if (treeStructure.left_child && (sideFilter === 'both' || sideFilter === 'left')) {
    extractFromChild(treeStructure.left_child, 'left', rootNodeId, 1);
    directChildrenCount++;
  }
  if (treeStructure.right_child && (sideFilter === 'both' || sideFilter === 'right')) {
    extractFromChild(treeStructure.right_child, 'right', rootNodeId, 1);
    directChildrenCount++;
  }

  // Extract from side_members (these contain all members on each side, already filtered by the API)
  // The API will return null for the filtered-out side when side='left' or side='right'
  // The processedNodeIds Set will prevent duplicates if a node appears in both children and side_members
  let leftSideMembersCount = 0;
  let rightSideMembersCount = 0;
  if (sideFilter === 'both' || sideFilter === 'left') {
    const beforeCount = members.length;
    extractMembers(treeStructure.left_side_members, 'left');
    leftSideMembersCount = members.length - beforeCount;
  }
  if (sideFilter === 'both' || sideFilter === 'right') {
    const beforeCount = members.length;
    extractMembers(treeStructure.right_side_members, 'right');
    rightSideMembersCount = members.length - beforeCount;
  }
  
  // Log extraction breakdown for debugging
  console.log('📊 [Binary Tree Extraction] Breakdown:', {
    directChildren: directChildrenCount,
    leftSideMembers: leftSideMembersCount,
    rightSideMembers: rightSideMembersCount,
    totalExtracted: members.length,
    note: 'Direct children are always shown separately and not included in side_members pagination',
  });

  // Final safety filter: ensure all members match the selected side and depth
  return members.filter(member => {
    // Filter by side
    if (sideFilter !== 'both' && member.position !== sideFilter) {
      return false;
    }
    // Filter by depth (additional safety check)
    if (minDepth !== undefined && member.level < minDepth) {
      return false;
    }
    if (maxDepth !== undefined && member.level > maxDepth) {
      return false;
    }
    return true;
  });
}

export const BinaryTreeView = () => {
  const { user } = useAppSelector((state) => state.auth);
  const distributorId = user?.id || "";

  // Pagination and filtering state - must be declared before use
  // Default values: page=1, page_size=2, max_depth=2
  const [sideFilter, setSideFilter] = useState<'left' | 'right' | 'both'>('both');
  const [leftPage, setLeftPage] = useState(1); // Default: 1 (API default when page_size is provided)
  const [rightPage, setRightPage] = useState(1); // Default: 1
  const [bothPage, setBothPage] = useState(1); // Default: 1 (for when side='both')
  const [pageSize, setPageSize] = useState(2); // Default: 2 (API default: 20, max: 100)
  const [minDepth, setMinDepth] = useState<number | undefined>(undefined); // Optional, no default
  const [maxDepth, setMaxDepth] = useState<number | undefined>(2); // Default: 2 (API default: 5)

  const { data: binaryTree, isLoading: treeLoading, refetch: refetchTree } = useGetBinaryTreeQuery(
    distributorId,
    { skip: !distributorId }
  );
  
  // Determine which page to use based on side filter
  // When side='both', use bothPage; otherwise use the specific side's page
  const currentPage = sideFilter === 'left' ? leftPage : sideFilter === 'right' ? rightPage : bothPage;
  
  // Memoize query parameters to prevent unnecessary API calls and re-renders
  // This ensures the API is only called when actual parameter values change
  // Default values: page=1, page_size=20 (matching API defaults)
  const queryParams = useMemo(() => {
    const params: {
      distributorId: string;
      side: 'left' | 'right' | 'both';
      page: number;
      page_size: number;
      min_depth?: number;
      max_depth?: number;
    } = {
      distributorId,
      side: sideFilter,
      page: currentPage,
      page_size: pageSize,
    };
    
    // Only include min_depth and max_depth if they are explicitly set
    // This prevents sending undefined/null values which could cause:
    // 1. Unnecessary query string parameters
    // 2. Caching issues (different cache keys for same logical query)
    // 3. API confusion about whether filters are applied
    if (minDepth !== undefined && minDepth !== null) {
      params.min_depth = minDepth;
    }
    if (maxDepth !== undefined && maxDepth !== null) {
      params.max_depth = maxDepth;
    }
    
    return params;
  }, [distributorId, sideFilter, currentPage, pageSize, minDepth, maxDepth]);
  
  const { data: treeStructure, isLoading: structureLoading, refetch: refetchStructure } = useGetTreeStructureQuery(
    queryParams,
    { 
      skip: !distributorId,
      refetchOnMountOrArgChange: true, // Ensure API is called when page_size or other params change
    }
  );
  
  // Track timing for data processing and display
  const dataProcessingStartRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (treeStructure && !structureLoading) {
      const processingStartTime = performance.now();
      dataProcessingStartRef.current = processingStartTime;
      performance.mark('binary-tree-data-processing-start');
      
      console.log('⏱️ [Binary Tree Component] Data received, starting processing...');
    }
  }, [treeStructure, structureLoading]);
  const {
    data: binaryStats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetBinaryStatsQuery(distributorId, { skip: !distributorId });
  const { data: pendingNodes = [], isLoading: pendingLoading } =
    useGetPendingNodesQuery(distributorId, { skip: !distributorId });
  const [positionPendingNode] = usePositionPendingNodeMutation();
  const [autoPlacePending, { isLoading: isAutoPlacing }] = useAutoPlacePendingMutation();
  const [checkPairs, { isLoading: isCheckingPairs }] = useCheckPairsMutation();


  // Pending node positioning state
  const [selectedPendingNode, setSelectedPendingNode] =
    useState<PendingNode | null>(null);
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [selectedSide, setSelectedSide] = useState<"left" | "right">("left");

  // Referral tree dialog state
  const [referralTreeDialogOpen, setReferralTreeDialogOpen] = useState(false);

  // Helper to get pagination info from side members
  const getPaginationInfo = (sideMembers: SideMemberNode[] | PaginatedSideMembers | null | undefined) => {
    if (!sideMembers) return null;
    if (typeof sideMembers === 'object' && 'results' in sideMembers) {
      return {
        count: sideMembers.count,
        page: sideMembers.page,
        page_size: sideMembers.page_size,
        total_pages: sideMembers.total_pages,
        next: sideMembers.next,
        previous: sideMembers.previous,
      };
    }
    return null;
  };

  const leftPagination = useMemo(() => getPaginationInfo(treeStructure?.left_side_members), [treeStructure]);
  const rightPagination = useMemo(() => getPaginationInfo(treeStructure?.right_side_members), [treeStructure]);

  // Extract team members from side_members arrays (preferred) or fallback to tree structure
  const teamMembers = useMemo(() => {
    const extractionStartTime = performance.now();
    
    // First try to use side_members from the full API response
    if (treeStructure) {
      console.log('BinaryTreeView: Using tree structure with side_members');
      console.log('BinaryTreeView: Side filter:', sideFilter);
      console.log('BinaryTreeView: Min depth:', minDepth, 'Max depth:', maxDepth);
      console.log('BinaryTreeView: Left side members:', treeStructure.left_side_members);
      console.log('BinaryTreeView: Right side members:', treeStructure.right_side_members);
      const members = extractTeamMembersFromSideMembers(treeStructure, sideFilter, minDepth, maxDepth);
      console.log('BinaryTreeView: Extracted team members from side_members:', members);
      
      const extractionEndTime = performance.now();
      const extractionDuration = extractionEndTime - extractionStartTime;
      console.log('⏱️ [Binary Tree Component] Data extraction time:', `${extractionDuration.toFixed(2)}ms`);
      console.log('⏱️ [Binary Tree Component] Extracted members count:', members.length);
      
      if (members.length > 0) {
        return members;
      }
    }
    
    // Fallback to tree structure traversal if side_members are not available
    if (binaryTree) {
      console.log('BinaryTreeView: Falling back to binary tree traversal');
      console.log('BinaryTreeView: Binary tree data:', binaryTree);
      const members = extractTeamMembers(binaryTree, 0, 'left', undefined, undefined, minDepth, maxDepth);
      console.log('BinaryTreeView: Extracted team members from tree:', members);
      
      const extractionEndTime = performance.now();
      const extractionDuration = extractionEndTime - extractionStartTime;
      console.log('⏱️ [Binary Tree Component] Data extraction time (fallback):', `${extractionDuration.toFixed(2)}ms`);
      
      // Filter by side if needed
      if (sideFilter !== 'both') {
        return members.filter(m => m.position === sideFilter);
      }
      return members;
    }
    
    console.log('BinaryTreeView: No data available');
    return [];
  }, [treeStructure, binaryTree, sideFilter, minDepth, maxDepth]);
  
  // Measure total time from API response to display
  useEffect(() => {
    if (teamMembers.length > 0 && dataProcessingStartRef.current) {
      const displayEndTime = performance.now();
      const totalProcessingTime = displayEndTime - dataProcessingStartRef.current;
      
      performance.mark('binary-tree-display-complete');
      
      try {
        performance.measure(
          'binary-tree-total-processing',
          'binary-tree-data-processing-start',
          'binary-tree-display-complete'
        );
        const measure = performance.getEntriesByName('binary-tree-total-processing')[0];
        const totalDuration = measure.duration;
        
        console.log('⏱️ [Binary Tree Component] Total processing + display time:', `${totalDuration.toFixed(2)}ms`);
        console.log('⏱️ [Binary Tree Component] Team members ready for display:', teamMembers.length);
        
        // Calculate total time from request start if available
        try {
          const apiMeasure = performance.getEntriesByName('binary-tree-api-duration')[0];
          if (apiMeasure) {
            const totalTimeFromRequest = apiMeasure.duration + totalDuration;
            console.log('⏱️ [Binary Tree Component] Total time (API + Processing + Display):', `${totalTimeFromRequest.toFixed(2)}ms`);
            console.log('📊 [Binary Tree Component] Performance Breakdown:', {
              'API Response Time': `${apiMeasure.duration.toFixed(2)}ms`,
              'Data Processing Time': `${totalDuration.toFixed(2)}ms`,
              'Total Time': `${totalTimeFromRequest.toFixed(2)}ms`,
            });
          }
        } catch (e) {
          // API timing not available
        }
      } catch (error) {
        console.warn('⏱️ [Binary Tree Component] Performance measurement error:', error);
      }
      
      // Reset ref
      dataProcessingStartRef.current = null;
    }
  }, [teamMembers.length]);

  // Use team members directly from server (no client-side filtering)
  const displayMembers = teamMembers;

  const handlePositionPendingNode = async () => {
    if (!selectedPendingNode || !distributorId || !selectedParentId) {
      toast.error("Please select a parent node and side");
      return;
    }

    // Extract numeric IDs for logging
    const targetUserId = parseInt(selectedPendingNode.userId, 10);
    let parentNodeId: number;
    if (selectedParentId.startsWith('node-')) {
      parentNodeId = parseInt(selectedParentId.replace('node-', ''), 10);
    } else {
      parentNodeId = parseInt(selectedParentId, 10);
    }

    // Prepare request body for logging
    const requestBody = {
      target_user_id: targetUserId,
      parent_node_id: parentNodeId,
      side: selectedSide, // "left" or "right"
    };

    // Console log the request body
    console.log('🔵 [Position Member] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🔵 [Position Member] Request Details:', {
      selectedPendingNode: selectedPendingNode.name,
      userId: selectedPendingNode.userId,
      parentId: selectedParentId,
      side: selectedSide,
      extractedParentNodeId: parentNodeId,
    });

    try {
      const result = await positionPendingNode({
        distributorId,
        userId: selectedPendingNode.userId,
        parentId: selectedParentId,
        side: selectedSide,
      }).unwrap();

      // Console log the response
      console.log('🟢 [Position Member] Response:', JSON.stringify(result, null, 2));
      console.log('🟢 [Position Member] Response Success:', result.success);
      console.log('🟢 [Position Member] Response Message:', result.message);

      if (result.success) {
        toast.success(`${selectedPendingNode.name} positioned successfully!`);
        setSelectedPendingNode(null);
        setPositionDialogOpen(false);
        setSelectedParentId("");
        setSelectedSide("left");
        // Refetch tree structure after positioning
        await refetchTree();
        await refetchStructure();
      } else {
        toast.error(result.message || "Failed to position node");
      }
    } catch (error: unknown) {
      // Console log the error
      console.error("🔴 [Position Member] Error:", error);
      console.error("🔴 [Position Member] Error Type:", typeof error);
      if (error && typeof error === "object") {
        console.error("🔴 [Position Member] Error Keys:", Object.keys(error));
        console.error("🔴 [Position Member] Error Stringified:", JSON.stringify(error, null, 2));
      }

      // Type guard to check if it's a FetchBaseQueryError
      const isFetchBaseQueryError = (err: unknown): err is FetchBaseQueryError => {
        return typeof err === 'object' && err !== null && 'status' in err;
      };

      // Type guard to check if it's a SerializedError
      const isSerializedError = (err: unknown): err is SerializedError => {
        return typeof err === 'object' && err !== null && 'message' in err && !('status' in err);
      };

      let errorMessage = "Failed to position node. Please try again.";

      if (isFetchBaseQueryError(error)) {
        const errorData = error.data;
        
        // Check for nested error structure: { error: "message" }
        if (errorData && typeof errorData === 'object') {
          if ('error' in errorData && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if ('message' in errorData && typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if ('detail' in errorData && typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData) && errorData.length > 0) {
            // Handle array responses (e.g., ["Error message"])
            errorMessage = String(errorData[0]);
          }
        } else if (typeof errorData === 'string') {
          // If error.data is directly a string
          errorMessage = errorData;
        }
      } else if (isSerializedError(error)) {
        errorMessage = error.message || "Failed to position node. Please try again.";
      }

      toast.error(errorMessage);
    }
  };

  const handlePendingNodeSelect = (pendingNode: PendingNode) => {
    setSelectedPendingNode(pendingNode);
    setPositionDialogOpen(true);
  };

  const handleAutoPosition = async () => {
    try {
      const result = await autoPlacePending().unwrap();
      console.log('Auto Place Pending Response:', result);
      toast.success('Pending users have been auto-positioned successfully!');
      setPositionDialogOpen(false);
      setSelectedPendingNode(null);
      setSelectedParentId("");
      setSelectedSide("left");
      // Refetch tree structure after auto placing
      await refetchTree();
      await refetchStructure();
    } catch (error: unknown) {
      console.error('Auto place pending error:', error);
      let errorMessage = "Failed to auto-position pending users. Please try again.";
      if (error && typeof error === "object") {
        if ("data" in error && error.data && typeof error.data === "object") {
          const errorData = error.data as {
            data?: string;
            error?: { data?: string };
            message?: string;
          };
          errorMessage =
            errorData.data ||
            errorData.error?.data ||
            errorData.message ||
            errorMessage;
        } else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
    }
  };

  const handleMatchPairs = async () => {
    try {
      const result = await checkPairs().unwrap();
      console.log('Check Pairs Response:', result);
      toast.success('Pairs matched successfully!');
      // Refetch tree structure after matching pairs
      await refetchTree();
      await refetchStructure();
      // Also refetch stats
      await refetchStats();
    } catch (error: unknown) {
      console.error('Check pairs error:', error);
      let errorMessage = "Failed to match pairs. Please try again.";
      if (error && typeof error === "object") {
        if ("data" in error && error.data && typeof error.data === "object") {
          const errorData = error.data as {
            data?: string;
            error?: { data?: string };
            message?: string;
          };
          errorMessage =
            errorData.data ||
            errorData.error?.data ||
            errorData.message ||
            errorMessage;
        } else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
    }
  };

  // Get available parent nodes for positioning
  const availableParents = useMemo(() => {
    if (!binaryTree) return [];
    const parents: { id: string; name: string }[] = [];

    // Include root node
    parents.push({ id: binaryTree.id, name: binaryTree.name });

    // Include all team members as potential parents
    teamMembers.forEach((member) => {
      parents.push({ id: member.id, name: member.name });
    });

    return parents;
  }, [binaryTree, teamMembers]);

  if (treeLoading || structureLoading || statsLoading || pendingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading team network..." size="md" />
      </div>
    );
  }

  if (!binaryTree) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Binary Tree View
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize your network structure
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No network data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Network</h1>
          <p className="text-muted-foreground mt-1">
            View your referral network and track team performance
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchStats()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Revenue Stream A (RSA) Count"
          value={binaryStats?.leftCount?.toString() || "0"}
          icon={Users}
          variant="info"
        />
        <StatsCard
          title="Revenue Stream B (RSB) Count"
          value={binaryStats?.rightCount?.toString() || "0"}
          icon={Users}
          variant="info"
        />
        <StatsCard
          title="Total Pairs"
          value={`${binaryStats?.totalPairs || 0}/${
            binaryStats?.maxPairs || 10
          }`}
          icon={GitBranch}
          variant="primary"
        />
        <StatsCard
          title="Total Earnings"
          value={`₹${(binaryStats?.totalEarnings || 0).toLocaleString()}`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Binary Account Enablement Status */}
      {binaryStats?.binaryActivated && binaryStats?.activationBonus && (
        <Alert className="bg-success/10 border-success/30">
          <Info className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            <strong>Team Commission Enabled!</strong> You've received ₹
            {binaryStats.activationBonus.toLocaleString()} as an account
            enablement bonus. You can now earn ₹2,000 for each new pair (up to
            10 pairs or ₹20,000).
          </AlertDescription>
        </Alert>
      )}

      {(binaryStats?.pairsBeyondLimit ?? 0) > 0 && (
        <Alert className="bg-warning/10 border-warning/30">
          <Info className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            <strong>Commission Limit Reached:</strong> You've reached the
            maximum of 10 pairs (₹20,000 commission).{" "}
            {binaryStats.pairsBeyondLimit} additional pair(s) are being tracked
            but won't generate commission (carry forward).
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Nodes Section */}
      {pendingNodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Pending Team Members ({pendingNodes.length})
            </CardTitle>
            <CardDescription>
              New team members waiting to be positioned in your network. Click
              on a pending member to position them in the network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {pendingNodes.map((pendingNode) => (
                <Card
                  key={pendingNode.id}
                  className="cursor-pointer transition-all hover:border-primary/50"
                  onClick={() => handlePendingNodeSelect(pendingNode)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="font-semibold">{pendingNode.name}</p>
                        </div>
                        {pendingNode.email && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {pendingNode.email}
                          </p>
                        )}
                        {pendingNode.pv > 0 ? (
                          <p className="text-sm text-muted-foreground mt-1">
                            PV: ₹{pendingNode.pv.toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            PV: N/A
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          User ID: {pendingNode.userId}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        Pending
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Position Pending Node Dialog */}
      <Dialog open={positionDialogOpen} onOpenChange={setPositionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Position {selectedPendingNode?.name}</DialogTitle>
            <DialogDescription>
              Select a parent node and position (RSA or RSB) to position this
              team member in your network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Parent Node</label>
              <Select
                value={selectedParentId}
                onValueChange={setSelectedParentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent node" />
                </SelectTrigger>
                <SelectContent>
                  {availableParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Select
                value={selectedSide}
                onValueChange={(value: "left" | "right") =>
                  setSelectedSide(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">RSA</SelectItem>
                  <SelectItem value="right">RSB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleAutoPosition}
                disabled={isAutoPlacing}
              >
                {isAutoPlacing ? "Positioning..." : "Auto Position"}
              </Button>
              <Button
                onClick={handlePositionPendingNode}
                disabled={!selectedParentId}
              >
                Position Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Network Table */}
      <Card className="overflow-hidden border-2 border-[#18b3b2]/20 shadow-xl shadow-slate-200/50 bg-gradient-to-b from-white to-slate-50/30">
        <CardHeader className="border-b border-[#18b3b2]/20 bg-gradient-to-r from-[#f0fdfa]/50 to-white pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">Team Network Structure</CardTitle>
              <CardDescription className="mt-1">
                View and manage your referral network in a structured table
                format
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMatchPairs}
                disabled={isCheckingPairs}
                className="flex items-center gap-2 border-[#18b3b2]/40 hover:bg-[#18b3b2]/10 hover:border-[#18b3b2] hover:text-[#0d9488]"
              >
                <Link2 className="h-4 w-4" />
                {isCheckingPairs ? "Matching..." : "Match Pairs"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReferralTreeDialogOpen(true)}
                className="flex items-center gap-2 border-[#18b3b2]/40 hover:bg-[#18b3b2]/10 hover:border-[#18b3b2] hover:text-[#0d9488]"
              >
                <Network className="h-4 w-4" />
                Referral Tree
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Server-side Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-[#f0fdfa]/60 to-slate-50/60 border border-[#18b3b2]/15">
            <Select
              value={sideFilter}
              onValueChange={(value: 'left' | 'right' | 'both') => {
                setSideFilter(value);
                setLeftPage(1);
                setRightPage(1);
                setBothPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] border-[#18b3b2]/25 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both Sides</SelectItem>
                <SelectItem value="left">Left (RSA)</SelectItem>
                <SelectItem value="right">Right (RSB)</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setLeftPage(1);
                setRightPage(1);
                setBothPage(1);
              }}
            >
              <SelectTrigger className="w-[100px] border-[#18b3b2]/25 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap text-foreground">Min Depth:</label>
              <Input
                type="number"
                min="0"
                value={minDepth ?? ''}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setMinDepth(value === '' ? undefined : Number(value));
                }}
                placeholder="0"
                className="w-[80px] border-[#18b3b2]/25"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap text-foreground">Max Depth:</label>
              <Input
                type="number"
                min="1"
                value={maxDepth ?? ''}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setMaxDepth(value === '' ? undefined : Number(value));
                }}
                placeholder="2"
                className="w-[80px] border-[#18b3b2]/25"
              />
            </div>
          </div>

          {/* Team Members Table */}
          {displayMembers.length > 0 ? (
            <>
              <div className="rounded-xl overflow-hidden border-2 border-[#18b3b2]/15 shadow-inner bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-[#18b3b2]/30 hover:bg-transparent">
                      <TableHead className="h-14 bg-gradient-to-r from-[#18b3b2]/15 to-[#22cc7b]/10 font-semibold text-foreground">Name</TableHead>
                      <TableHead className="h-14 bg-gradient-to-r from-[#18b3b2]/15 to-[#22cc7b]/10 font-semibold text-foreground">Level</TableHead>
                      <TableHead className="h-14 bg-gradient-to-r from-[#18b3b2]/15 to-[#22cc7b]/10 font-semibold text-foreground">Direct Parent</TableHead>
                      <TableHead className="h-14 bg-gradient-to-r from-[#18b3b2]/15 to-[#22cc7b]/10 font-semibold text-foreground">Referral Code</TableHead>
                      <TableHead className="h-14 bg-gradient-to-r from-[#18b3b2]/15 to-[#22cc7b]/10 font-semibold text-foreground">Position</TableHead>
                      <TableHead className="h-14 bg-gradient-to-r from-[#18b3b2]/15 to-[#22cc7b]/10 font-semibold text-foreground">Joined Date</TableHead>
                      <TableHead className="h-14 bg-gradient-to-r from-[#18b3b2]/15 to-[#22cc7b]/10 font-semibold text-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayMembers.map((member, index) => (
                      <TableRow
                        key={member.id}
                        className={`border-b border-slate-100 transition-colors hover:bg-[#18b3b2]/5 ${index % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                      >
                        <TableCell className="font-medium py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18b3b2]/10">
                              <User className="h-4 w-4 text-[#0d9488]" />
                            </div>
                            {member.name}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className="border-[#18b3b2]/40 bg-[#f0fdfa]/50 text-foreground font-medium">
                            Level {member.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium py-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {member.parentName || "Root"}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {member.referralCode ? (
                            <code className="text-sm font-mono font-medium px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#18b3b2]/15 to-[#22cc7b]/15 text-[#0d9488] border border-[#18b3b2]/30">
                              {member.referralCode}
                            </code>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={
                              member.position === "left"
                                ? "bg-gradient-to-r from-[#18b3b2] to-[#22cc7b] text-white border-0"
                                : "bg-slate-200 text-slate-700 border-0 font-medium"
                            }
                          >
                            {member.position === "left" ? "RSA" : "RSB"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-muted-foreground">
                          {new Date(member.joinedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="py-4">
                          {member.isActive ? (
                            <Badge
                              className="bg-gradient-to-r from-[#18b3b2] to-[#22cc7b] text-white border-0"
                            >
                              <Activity className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <div className="inline-block">
                                  <Badge
                                    className="bg-yellow-500 text-yellow-900 border-0 cursor-help hover:bg-yellow-600"
                                  >
                                    Inactive
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                align="center"
                                className="max-w-xs"
                                sideOffset={8}
                              >
                                Only active member nodes are eligible for commission earnings.
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls - Single unified control */}
            {(leftPagination || rightPagination) && (
              <div className="mt-6 pt-4 border-t border-[#18b3b2]/15">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {sideFilter === 'both' && leftPagination && rightPagination && (
                      <>
                        Showing {((bothPage - 1) * pageSize) + 1} to {Math.min(bothPage * pageSize, leftPagination.count + rightPagination.count)} of{' '}
                        {leftPagination.count + rightPagination.count} total members
                        {' '}(Left: {leftPagination.count}, Right: {rightPagination.count})
                      </>
                    )}
                    {sideFilter === 'left' && leftPagination && (
                      <>
                        Showing {((leftPagination.page - 1) * leftPagination.page_size) + 1} to{' '}
                        {Math.min(leftPagination.page * leftPagination.page_size, leftPagination.count)} of{' '}
                        {leftPagination.count} members
                      </>
                    )}
                    {sideFilter === 'right' && rightPagination && (
                      <>
                        Showing {((rightPagination.page - 1) * rightPagination.page_size) + 1} to{' '}
                        {Math.min(rightPagination.page * rightPagination.page_size, rightPagination.count)} of{' '}
                        {rightPagination.count} members
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (sideFilter === 'both') {
                          setBothPage(prev => Math.max(1, prev - 1));
                        } else if (sideFilter === 'left') {
                          setLeftPage(prev => Math.max(1, prev - 1));
                        } else {
                          setRightPage(prev => Math.max(1, prev - 1));
                        }
                      }}
                      disabled={
                        (sideFilter === 'both' && leftPagination && rightPagination && (!leftPagination.previous && !rightPagination.previous || bothPage === 1)) ||
                        (sideFilter === 'left' && (!leftPagination?.previous || leftPagination.page === 1)) ||
                        (sideFilter === 'right' && (!rightPagination?.previous || rightPagination.page === 1))
                      }
                      className="border-[#18b3b2]/30 hover:bg-[#18b3b2]/10 hover:border-[#18b3b2]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      {sideFilter === 'both' && leftPagination && rightPagination && (
                        <>Page {bothPage} of {Math.max(leftPagination.total_pages, rightPagination.total_pages)}</>
                      )}
                      {sideFilter === 'left' && leftPagination && (
                        <>Page {leftPagination.page} of {leftPagination.total_pages}</>
                      )}
                      {sideFilter === 'right' && rightPagination && (
                        <>Page {rightPagination.page} of {rightPagination.total_pages}</>
                      )}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (sideFilter === 'both') {
                          const maxPages = leftPagination && rightPagination 
                            ? Math.max(leftPagination.total_pages, rightPagination.total_pages) 
                            : leftPagination?.total_pages || rightPagination?.total_pages || 1;
                          setBothPage(prev => Math.min(maxPages, prev + 1));
                        } else if (sideFilter === 'left') {
                          setLeftPage(prev => Math.min(leftPagination?.total_pages || 1, prev + 1));
                        } else {
                          setRightPage(prev => Math.min(rightPagination?.total_pages || 1, prev + 1));
                        }
                      }}
                      disabled={
                        (sideFilter === 'both' && leftPagination && rightPagination && (!leftPagination.next && !rightPagination.next || bothPage === Math.max(leftPagination.total_pages, rightPagination.total_pages))) ||
                        (sideFilter === 'left' && (!leftPagination?.next || leftPagination.page === leftPagination.total_pages)) ||
                        (sideFilter === 'right' && (!rightPagination?.next || rightPagination.page === rightPagination.total_pages))
                      }
                      className="border-[#18b3b2]/30 hover:bg-[#18b3b2]/10 hover:border-[#18b3b2]"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

              {/* Show pagination info when no pagination is available (backward compatibility) */}
              {!leftPagination && !rightPagination && treeStructure && (
                <div className="mt-6 pt-4 border-t border-[#18b3b2]/15">
                  <div className="text-sm text-muted-foreground text-center py-2 rounded-lg bg-slate-50/80">
                    Showing all {displayMembers.length} members (pagination not enabled)
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No team members found</p>
              <p className="text-sm mt-2">
                Try adjusting your filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Tree Dialog */}
      <Dialog
        open={referralTreeDialogOpen}
        onOpenChange={setReferralTreeDialogOpen}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden border-2 border-[#18b3b2]/20 shadow-2xl bg-gradient-to-b from-white to-slate-50/50">
          <DialogHeader className="px-6 py-5 border-b border-[#18b3b2]/20 bg-gradient-to-r from-[#f0fdfa]/80 to-white">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#18b3b2] to-[#22cc7b] bg-clip-text text-transparent">
              Referral Tree Structure
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Visual representation of your referral network structure
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh] w-full">
            <motion.div
              className="flex justify-center items-start p-8 overflow-auto bg-gradient-to-b from-transparent via-[#f0fdfa]/30 to-transparent min-h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {binaryTree ? (
                <BinaryTreeNode node={binaryTree} depth={0} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-8 rounded-2xl bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-[#18b3b2]/20">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18b3b2]/15 to-[#22cc7b]/15 mb-4">
                    <GitBranch className="h-8 w-8 text-[#18b3b2]" />
                  </div>
                  <p className="text-base font-medium text-foreground">No referral tree data available</p>
                  <p className="text-sm text-muted-foreground mt-1">Your network will appear here once you have referrals</p>
                </div>
              )}
            </motion.div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Pair Matching Info */}
      {/* <Card>
        <CardHeader>
          <CardTitle>How Team Network Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold mb-2">
                Account Enablement Requirements
              </h4>
              <p className="text-sm text-muted-foreground">
                Team Commission starts when you add 3 users (not pairs) as
                referrals in your team network. Upon account enablement, you'll
                receive ₹2,000 as an account enablement bonus.
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold mb-2">Team Matching</h4>
              <p className="text-sm text-muted-foreground">
                After account enablement, teams are formed when you have
                referrals on both sides of your network. Each matched team earns
                you ₹2,000 commission. Check the stats above for your current
                pair count.
              </p>
            </div>
            <div className="p-4 bg-warning/5 rounded-lg">
              <h4 className="font-semibold mb-2">Commission Breakdown</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • ₹2,000 per team match commission (after account enablement)
                </li>
                <li>• Maximum ₹20,000 total commission</li>
                <li>• 10% TDS deduction</li>
                <li>• ₹4,000 added to Pool Money when reaching the limit</li>
                <li>
                  • Additional pairs beyond the limit are tracked but don't
                  generate commission (carry forward)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};
