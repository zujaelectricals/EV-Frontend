import { useState, useMemo } from "react";
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
  parentName?: string
): TeamMember[] {
  if (!node || node.position === "root") {
    const members: TeamMember[] = [];
    if (node?.children.left) {
      members.push(
        ...extractTeamMembers(
          node.children.left,
          level + 1,
          "left",
          node.id,
          node.name
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
          node.name
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

  const members = [member];
  if (node.children.left) {
    members.push(
      ...extractTeamMembers(
        node.children.left,
        level + 1,
        "left",
        node.id,
        node.name
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
        node.name
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

// Helper function to create a lookup map for parent names
function createParentNameMap(treeStructure: TreeNodeResponse | undefined): Map<number, string> {
  const parentMap = new Map<number, string>();
  
  if (!treeStructure) return parentMap;
  
  // Add root node
  parentMap.set(treeStructure.node_id, treeStructure.user_full_name || treeStructure.user_username || 'Root');
  
  // Recursively add all nodes to the map
  function addNodeToMap(node: TreeNodeResponse | null) {
    if (!node) return;
    
    parentMap.set(node.node_id, node.user_full_name || node.user_username || node.user_email || 'Unknown');
    
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
  treeStructure: TreeNodeResponse | undefined
): TeamMember[] {
  if (!treeStructure) {
    return [];
  }

  const members: TeamMember[] = [];
  const parentNameMap = createParentNameMap(treeStructure);
  const processedNodeIds = new Set<number>(); // Track processed nodes to avoid duplicates

  // Helper function to convert TreeNodeResponse to TeamMember
  const nodeToMember = (node: TreeNodeResponse, position: 'left' | 'right', parentId?: number): TeamMember => {
    const parentName = parentId ? parentNameMap.get(parentId) : undefined;
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

  // Helper function to recursively extract from child nodes (only if side_members not available)
  const extractFromChild = (child: TreeNodeResponse | null, position: 'left' | 'right', rootNodeId: number) => {
    if (!child) return;
    
    const nodeId = child.node_id || child.id || child.user_id;
    if (processedNodeIds.has(nodeId)) return; // Avoid duplicates
    processedNodeIds.add(nodeId);
    
    members.push(nodeToMember(child, position, rootNodeId));
    
    // Recursively process children
    if (child.left_child) {
      extractFromChild(child.left_child, 'left', nodeId);
    }
    if (child.right_child) {
      extractFromChild(child.right_child, 'right', nodeId);
    }
  };

  // Helper function to extract members from either array or paginated format
  const extractMembers = (sideMembers: SideMemberNode[] | PaginatedSideMembers | null | undefined, position: 'left' | 'right') => {
    if (!sideMembers) return;

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
        const nodeId = member.node_id || member.user_id;
        // Skip if already processed
        if (processedNodeIds.has(nodeId)) return;
        processedNodeIds.add(nodeId);
        
        const parentId = member.parent;
        const parentName = parentId ? parentNameMap.get(parentId) : undefined;
        
        members.push({
          id: `node-${nodeId}`,
          name: member.user_full_name || member.user_username || member.user_email || 'Unknown',
          userId: member.user_id?.toString(),
          joinedAt: member.date_joined || member.created_at || new Date().toISOString(),
          position: position,
          pv: parseFloat(member.total_earnings || '0'),
          level: member.level || 0,
          referrals: 0, // Not available in side member structure
          isActive: member.is_active_buyer !== false,
          parentId: parentId ? `node-${parentId}` : undefined,
          parentName: parentName || undefined,
          referralCode: member.referral_code || undefined,
        });
      }
    });
  };

  const rootNodeId = treeStructure.node_id || treeStructure.id || treeStructure.user_id;

  // Always extract direct children (left_child and right_child) first
  // These are the immediate children of the root node
  if (treeStructure.left_child) {
    extractFromChild(treeStructure.left_child, 'left', rootNodeId);
  }
  if (treeStructure.right_child) {
    extractFromChild(treeStructure.right_child, 'right', rootNodeId);
  }

  // Then extract from side_members (these contain all members on each side, already filtered by the API)
  // The API will return null for the filtered-out side when side='left' or side='right'
  // The processedNodeIds Set will prevent duplicates if a node appears in both children and side_members
  extractMembers(treeStructure.left_side_members, 'left');
  extractMembers(treeStructure.right_side_members, 'right');

  return members;
}

export const BinaryTreeView = () => {
  const { user } = useAppSelector((state) => state.auth);
  const distributorId = user?.id || "";

  // Pagination and filtering state - must be declared before use
  const [sideFilter, setSideFilter] = useState<'left' | 'right' | 'both'>('both');
  const [leftPage, setLeftPage] = useState(1);
  const [rightPage, setRightPage] = useState(1);
  const [bothPage, setBothPage] = useState(1); // For when side='both'
  const [pageSize, setPageSize] = useState(20);
  const [minDepth, setMinDepth] = useState<number | undefined>(undefined);
  const [maxDepth, setMaxDepth] = useState<number | undefined>(5);

  const { data: binaryTree, isLoading: treeLoading, refetch: refetchTree } = useGetBinaryTreeQuery(
    distributorId,
    { skip: !distributorId }
  );
  
  // Determine which page to use based on side filter
  // When side='both', use bothPage; otherwise use the specific side's page
  const currentPage = sideFilter === 'left' ? leftPage : sideFilter === 'right' ? rightPage : bothPage;
  
  const { data: treeStructure, isLoading: structureLoading, refetch: refetchStructure } = useGetTreeStructureQuery(
    {
      distributorId,
      side: sideFilter,
      page: currentPage,
      page_size: pageSize,
      min_depth: minDepth,
      max_depth: maxDepth,
    },
    { skip: !distributorId }
  );
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
    // First try to use side_members from the full API response
    if (treeStructure) {
      console.log('BinaryTreeView: Using tree structure with side_members');
      console.log('BinaryTreeView: Left side members:', treeStructure.left_side_members);
      console.log('BinaryTreeView: Right side members:', treeStructure.right_side_members);
      const members = extractTeamMembersFromSideMembers(treeStructure);
      console.log('BinaryTreeView: Extracted team members from side_members:', members);
      if (members.length > 0) {
        return members;
      }
    }
    
    // Fallback to tree structure traversal if side_members are not available
    if (binaryTree) {
      console.log('BinaryTreeView: Falling back to binary tree traversal');
      console.log('BinaryTreeView: Binary tree data:', binaryTree);
      const members = extractTeamMembers(binaryTree);
      console.log('BinaryTreeView: Extracted team members from tree:', members);
      return members;
    }
    
    console.log('BinaryTreeView: No data available');
    return [];
  }, [treeStructure, binaryTree]);

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

      let errorMessage = "Failed to position node. Please try again.";
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
      {!binaryStats?.binaryActivated && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Network Not Enabled:</strong> You need at least 3 users (not
            pairs) as referrals in your team network to enable Binary
            Commission. Once enabled, you'll receive ₹2,000 as an account
            enablement bonus.
          </AlertDescription>
        </Alert>
      )}

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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>Team Network Structure</CardTitle>
              <CardDescription>
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
                className="flex items-center gap-2"
              >
                <Link2 className="h-4 w-4" />
                {isCheckingPairs ? "Matching..." : "Match Pairs"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReferralTreeDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Network className="h-4 w-4" />
                Referral Tree
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Server-side Filters - All in one line */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Select
              value={sideFilter}
              onValueChange={(value: 'left' | 'right' | 'both') => {
                setSideFilter(value);
                setLeftPage(1);
                setRightPage(1);
                setBothPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
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
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Min Depth:</label>
              <Input
                type="number"
                min="0"
                value={minDepth ?? ''}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setMinDepth(value === '' ? undefined : Number(value));
                }}
                placeholder="0"
                className="w-[80px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Max Depth:</label>
              <Input
                type="number"
                min="1"
                value={maxDepth ?? ''}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setMaxDepth(value === '' ? undefined : Number(value));
                }}
                placeholder="5"
                className="w-[80px]"
              />
            </div>
          </div>

          {/* Team Members Table */}
          {displayMembers.length > 0 ? (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Direct Parent</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Joined Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {member.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Level {member.level}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {member.parentName || "Root"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.referralCode ? (
                            <code className="text-sm bg-secondary px-2 py-1 rounded font-mono">
                              {member.referralCode}
                            </code>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.position === "left" ? "default" : "secondary"
                            }
                          >
                            {member.position === "left" ? "RSA" : "RSB"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(member.joinedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={member.isActive ? "default" : "outline"}
                          >
                            {member.isActive ? (
                              <>
                                <Activity className="mr-1 h-3 w-3" />
                                Active
                              </>
                            ) : (
                              "Inactive"
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls - Single unified control */}
            {(leftPagination || rightPagination) && (
              <div className="mt-4 pt-4 border-t">
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
                        (sideFilter === 'both' && (!leftPagination?.previous || bothPage === 1)) ||
                        (sideFilter === 'left' && (!leftPagination?.previous || leftPagination.page === 1)) ||
                        (sideFilter === 'right' && (!rightPagination?.previous || rightPagination.page === 1))
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      {sideFilter === 'both' && leftPagination && (
                        <>Page {bothPage} of {leftPagination.total_pages}</>
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
                          setBothPage(prev => Math.min(leftPagination?.total_pages || 1, prev + 1));
                        } else if (sideFilter === 'left') {
                          setLeftPage(prev => Math.min(leftPagination?.total_pages || 1, prev + 1));
                        } else {
                          setRightPage(prev => Math.min(rightPagination?.total_pages || 1, prev + 1));
                        }
                      }}
                      disabled={
                        (sideFilter === 'both' && (!leftPagination?.next || bothPage === (leftPagination?.total_pages || 1))) ||
                        (sideFilter === 'left' && (!leftPagination?.next || leftPagination.page === leftPagination.total_pages)) ||
                        (sideFilter === 'right' && (!rightPagination?.next || rightPagination.page === rightPagination.total_pages))
                      }
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
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground text-center">
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
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Referral Tree Structure</DialogTitle>
            <DialogDescription>
              Visual representation of your MLM referral network structure
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh] w-full">
            <div className="flex justify-center items-start p-8 overflow-auto">
              {binaryTree ? (
                <BinaryTreeNode node={binaryTree} depth={0} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No referral tree data available</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Pair Matching Info */}
      <Card>
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
      </Card>
    </div>
  );
};
