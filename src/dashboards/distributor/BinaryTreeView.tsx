import { useState, useMemo } from "react";
import {
  GitBranch,
  Users,
  TrendingUp,
  Info,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Activity,
  User,
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
  useGetBinaryStatsQuery,
  useGetPendingNodesQuery,
  usePositionPendingNodeMutation,
  type BinaryNode,
  type PendingNode,
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
  if (node.children.right)
    count += 1 + countDescendants(node.children.right);
  return count;
}

export const BinaryTreeView = () => {
  const { user } = useAppSelector((state) => state.auth);
  const distributorId = user?.id || "";
  const { data: binaryTree, isLoading: treeLoading } = useGetBinaryTreeQuery(
    distributorId,
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
  
  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPosition, setFilterPosition] = useState<"all" | "left" | "right">("all");
  const [sortBy, setSortBy] = useState<"name" | "joinedAt" | "pv" | "referrals" | "level">("level");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Pending node positioning state
  const [selectedPendingNode, setSelectedPendingNode] =
    useState<PendingNode | null>(null);
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [selectedSide, setSelectedSide] = useState<"left" | "right">("left");

  // Extract team members from binary tree
  const teamMembers = useMemo(() => {
    if (!binaryTree) return [];
    return extractTeamMembers(binaryTree);
  }, [binaryTree]);

  // Filter and sort team members
  const filteredMembers = useMemo(() => {
    let filtered = teamMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.parentName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition =
        filterPosition === "all" || member.position === filterPosition;
      return matchesSearch && matchesPosition;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "joinedAt":
          comparison =
            new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
          break;
        case "pv":
          comparison = a.pv - b.pv;
          break;
        case "referrals":
          comparison = a.referrals - b.referrals;
          break;
        case "level":
          comparison = a.level - b.level;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [teamMembers, searchQuery, filterPosition, sortBy, sortOrder]);

  const handleSort = (
    field: "name" | "joinedAt" | "pv" | "referrals" | "level"
  ) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handlePositionPendingNode = async () => {
    if (!selectedPendingNode || !distributorId || !selectedParentId) {
      toast.error("Please select a parent node and side");
      return;
    }

    try {
      const result = await positionPendingNode({
        distributorId,
        userId: selectedPendingNode.userId,
        parentId: selectedParentId,
        side: selectedSide,
      }).unwrap();

      if (result.success) {
        toast.success(`${selectedPendingNode.name} positioned successfully!`);
        setSelectedPendingNode(null);
        setPositionDialogOpen(false);
        setSelectedParentId("");
        setSelectedSide("left");
      } else {
        toast.error(result.message || "Failed to position node");
      }
    } catch (error: unknown) {
      console.error("Position node error:", error);
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

  if (treeLoading || statsLoading || pendingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading team network...</div>
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
                        <p className="text-sm text-muted-foreground mt-1">
                          PV: ₹{pendingNode.pv.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined:{" "}
                          {new Date(pendingNode.joinedAt).toLocaleDateString()}
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
              Select a parent node and position (RSA or RSB) to position
              this team member in your network.
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
                  <SelectItem value="left">RSA (Revenue Stream A)</SelectItem>
                  <SelectItem value="right">RSB (Revenue Stream B)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setPositionDialogOpen(false);
                  setSelectedPendingNode(null);
                  setSelectedParentId("");
                  setSelectedSide("left");
                }}
              >
                Cancel
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
          <CardTitle>Team Network Structure</CardTitle>
          <CardDescription>
            View and manage your referral network in a structured table format
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or parent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filterPosition}
              onValueChange={(value: "all" | "left" | "right") =>
                setFilterPosition(value)
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="left">Revenue Stream A</SelectItem>
                <SelectItem value="right">Revenue Stream B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Members Table */}
          {filteredMembers.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("name")}
                      >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("level")}
                      >
                        Level
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("pv")}
                      >
                        PV (Point Value)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("referrals")}
                      >
                        Referrals
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("joinedAt")}
                      >
                        Joined Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
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
                      <TableCell className="text-muted-foreground">
                        {member.parentName || "Root"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.position === "left" ? "default" : "secondary"
                          }
                        >
                          {member.position === "left"
                            ? "Revenue Stream A"
                            : "Revenue Stream B"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{member.pv.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {member.referrals}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(member.joinedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
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
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No team members found</p>
              {searchQuery && (
                <p className="text-sm mt-2">
                  Try adjusting your search or filters
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
