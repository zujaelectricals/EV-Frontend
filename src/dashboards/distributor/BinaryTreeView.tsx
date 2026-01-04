import { useState } from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  Users,
  TrendingUp,
  Info,
  AlertCircle,
  RefreshCw,
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
  useMoveNodeMutation,
  type BinaryNode,
  type PendingNode,
} from "@/app/api/binaryApi";
import { BinaryTreeNode } from "@/binary/components/BinaryTreeNode";
import { StatsCard } from "@/shared/components/StatsCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const [moveNode] = useMoveNodeMutation();
  const [selectedNode, setSelectedNode] = useState<BinaryNode | null>(null);
  const [selectedPendingNode, setSelectedPendingNode] =
    useState<PendingNode | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const handlePositionPendingNode = async (
    parentId: string,
    side: "left" | "right"
  ) => {
    if (!selectedPendingNode || !distributorId) {
      toast.error("Please select a pending team member first");
      return;
    }

    try {
      const result = await positionPendingNode({
        distributorId,
        userId: selectedPendingNode.userId,
        parentId,
        side,
      }).unwrap();

      if (result.success) {
        toast.success(`${selectedPendingNode.name} positioned successfully!`);
        setSelectedPendingNode(null);
      } else {
        toast.error(result.message || "Failed to position node");
      }
    } catch (error: unknown) {
      console.error("Position node error:", error);
      // RTK Query error structure: error.data or error.error.data
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

  const handleNodeDrop = async (
    nodeId: string,
    newParentId: string,
    newSide: "left" | "right"
  ) => {
    if (!distributorId) {
      toast.error("Distributor ID not found");
      return;
    }

    try {
      const result = await moveNode({
        distributorId,
        nodeId,
        newParentId,
        newSide,
      }).unwrap();

      if (result.success) {
        toast.success("Node moved successfully!");
        setDraggedNodeId(null);
      } else {
        toast.error(result.message || "Failed to move node");
      }
    } catch (error: unknown) {
      console.error("Move node error:", error);
      // RTK Query error structure: error.data or error.error.data
      let errorMessage = "Failed to move node. Please try again.";
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
            <strong>Binary Commission Enabled!</strong> You've received ₹
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
              New team members waiting to be positioned in your network. Select
              a pending member, then click on a node in the tree to position
              them (left-click for Revenue Stream A, right-click for Revenue
              Stream B), or click on empty slots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {pendingNodes.map((pendingNode) => (
                <Card
                  key={pendingNode.id}
                  className={`cursor-pointer transition-all ${
                    selectedPendingNode?.id === pendingNode.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPendingNode(pendingNode)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{pendingNode.name}</p>
                        <p className="text-sm text-muted-foreground">
                          PV: ₹{pendingNode.pv.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined:{" "}
                          {new Date(pendingNode.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedPendingNode && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Positioning {selectedPendingNode.name}:</strong> Click
                  on any node in the tree below to position them as a child
                  (left-click for Revenue Stream A, right-click for Revenue
                  Stream B). You can also click on empty slots (marked with L or
                  R) to position them directly.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team Network Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Team Network Structure</CardTitle>
          <CardDescription>
            {selectedPendingNode
              ? `Click on a node to position ${selectedPendingNode.name} (left-click: Revenue Stream A, right-click: Revenue Stream B)`
              : "Your referral network structure - Click on any team member to view details, or drag to reposition"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full h-[600px] p-4">
            <div className="flex justify-center">
              <BinaryTreeNode
                node={binaryTree}
                onNodeClick={(node) => {
                  if (selectedPendingNode) {
                    // Position pending node - show a simple dialog or use left by default
                    // For now, we'll use left. User can right-click for right
                    handlePositionPendingNode(node.id, "left");
                  } else {
                    // Type assertion: node from tree query should have all BinaryNode properties
                    setSelectedNode(node as BinaryNode);
                  }
                }}
                onNodeDrop={handleNodeDrop}
                draggedNodeId={draggedNodeId}
                onDragStart={setDraggedNodeId}
                selectedPendingNode={selectedPendingNode}
                onPositionPendingNode={handlePositionPendingNode}
              />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle>Node Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-semibold">{selectedNode.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Position</Label>
                <Badge variant="outline" className="capitalize">
                  {selectedNode.position}
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  PV (Point Value)
                </Label>
                <p className="font-semibold">
                  ₹{selectedNode.pv.toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Badge
                  className={selectedNode.isActive ? "bg-success" : "bg-muted"}
                >
                  {selectedNode.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Joined At</Label>
                <p className="text-sm">
                  {new Date(selectedNode.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                Binary Commission starts when you add 3 users (not pairs) as
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
