import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BinaryNode {
  id: string;
  name: string;
  position: 'left' | 'right' | 'root';
  pv: number;
  isActive: boolean;
  userId?: string;
  children: {
    left: BinaryNode | null;
    right: BinaryNode | null;
  };
}

interface PendingNode {
  id: string;
  userId: string;
  name: string;
  pv: number;
  joinedAt: string;
}

interface BinaryTreeNodeProps {
  node: BinaryNode;
  depth?: number;
  onNodeClick?: (node: BinaryNode) => void;
  onNodeDrop?: (nodeId: string, parentId: string, side: 'left' | 'right') => void;
  draggedNodeId?: string | null;
  onDragStart?: (nodeId: string | null) => void;
  selectedPendingNode?: PendingNode | null;
  onPositionPendingNode?: (parentId: string, side: 'left' | 'right') => void;
}

export const BinaryTreeNode = ({ 
  node, 
  depth = 0, 
  onNodeClick,
  onNodeDrop,
  draggedNodeId,
  onDragStart,
  selectedPendingNode,
  onPositionPendingNode,
}: BinaryTreeNodeProps) => {
  const hasChildren = node.children.left || node.children.right;
  const isDragging = draggedNodeId === node.id;
  const canDrag = node.position !== 'root' && onNodeDrop && !selectedPendingNode;

  const handleDragStart = (e: React.DragEvent) => {
    if (canDrag && onDragStart) {
      onDragStart(node.id);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', node.id);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(null);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <motion.div
        draggable={canDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: isDragging ? 0.9 : 1, opacity: isDragging ? 0.5 : 1 }}
        transition={{ delay: depth * 0.1, duration: 0.3 }}
        whileHover={!isDragging ? { scale: 1.1 } : {}}
        onClick={(e) => {
          e.stopPropagation();
          if (selectedPendingNode && onPositionPendingNode) {
            // Show a simple prompt or use left by default, right on right-click
            onPositionPendingNode(node.id, 'left');
          } else {
            onNodeClick?.(node);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (selectedPendingNode && onPositionPendingNode) {
            onPositionPendingNode(node.id, 'right');
          }
        }}
        className={cn(
          'relative rounded-xl border-2 p-4 transition-all',
          canDrag ? 'cursor-move' : 'cursor-pointer',
          node.isActive
            ? 'border-primary bg-primary/10 shadow-[0_4px_6px_-1px_hsl(222_47%_11%/_0.1),_0_2px_4px_-1px_hsl(222_47%_11%/_0.06)]'
            : 'border-muted bg-muted/50',
          node.position === 'root' && 'border-primary bg-primary/20',
          isDragging && 'opacity-50 z-50',
          selectedPendingNode && 'ring-2 ring-warning ring-offset-2'
        )}
      >
        {/* Pulse effect for root */}
        {node.position === 'root' && (
          <div className="absolute inset-0 animate-pulse rounded-xl bg-primary/10" />
        )}

        <div className="relative flex flex-col items-center gap-2">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              node.isActive ? 'bg-primary/30' : 'bg-muted'
            )}
          >
            <User className={cn('h-6 w-6', node.isActive ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{node.name}</p>
            <p className={cn('text-xs', node.isActive ? 'text-primary' : 'text-muted-foreground')}>
              PV: {node.pv.toLocaleString()}
            </p>
          </div>
          <span
            className={cn(
              'absolute -right-2 -top-2 h-3 w-3 rounded-full',
              node.isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground'
            )}
          />
        </div>
      </motion.div>

      {/* Connector lines */}
      {hasChildren && (
        <>
          <div className="h-6 w-px bg-gradient-to-b from-primary/50 to-transparent" />
          <div className="flex">
            {/* Left branch */}
            <div className="flex flex-col items-center">
              <div className="h-px w-16 bg-gradient-to-l from-primary/50 to-transparent" />
              <div className="h-6 w-px bg-gradient-to-b from-primary/50 to-transparent" />
            </div>
            {/* Right branch */}
            <div className="flex flex-col items-center">
              <div className="h-px w-16 bg-gradient-to-r from-primary/50 to-transparent" />
              <div className="h-6 w-px bg-gradient-to-b from-primary/50 to-transparent" />
            </div>
          </div>

          {/* Children */}
          <div className="flex gap-8">
            <div className="flex flex-col items-center">
              {node.children.left ? (
                <BinaryTreeNode 
                  node={node.children.left} 
                  depth={depth + 1} 
                  onNodeClick={onNodeClick}
                  onNodeDrop={onNodeDrop}
                  draggedNodeId={draggedNodeId}
                  onDragStart={onDragStart}
                  selectedPendingNode={selectedPendingNode}
                  onPositionPendingNode={onPositionPendingNode}
                />
              ) : (
                <EmptyNode 
                  position="left" 
                  parentId={node.id}
                  onNodeDrop={onNodeDrop}
                  draggedNodeId={draggedNodeId}
                  selectedPendingNode={selectedPendingNode}
                  onPositionPendingNode={onPositionPendingNode}
                />
              )}
            </div>
            <div className="flex flex-col items-center">
              {node.children.right ? (
                <BinaryTreeNode 
                  node={node.children.right} 
                  depth={depth + 1} 
                  onNodeClick={onNodeClick}
                  onNodeDrop={onNodeDrop}
                  draggedNodeId={draggedNodeId}
                  onDragStart={onDragStart}
                  selectedPendingNode={selectedPendingNode}
                  onPositionPendingNode={onPositionPendingNode}
                />
              ) : (
                <EmptyNode 
                  position="right" 
                  parentId={node.id}
                  onNodeDrop={onNodeDrop}
                  draggedNodeId={draggedNodeId}
                  selectedPendingNode={selectedPendingNode}
                  onPositionPendingNode={onPositionPendingNode}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface EmptyNodeProps {
  position: 'left' | 'right';
  parentId: string;
  onNodeDrop?: (nodeId: string, parentId: string, side: 'left' | 'right') => void;
  draggedNodeId?: string | null;
  selectedPendingNode?: PendingNode | null;
  onPositionPendingNode?: (parentId: string, side: 'left' | 'right') => void;
}

const EmptyNode = ({ 
  position, 
  parentId,
  onNodeDrop,
  draggedNodeId,
  selectedPendingNode,
  onPositionPendingNode,
}: EmptyNodeProps) => {
  const [isOver, setIsOver] = React.useState(false);

  const handleClick = () => {
    if (selectedPendingNode && onPositionPendingNode) {
      onPositionPendingNode(parentId, position);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    const nodeId = e.dataTransfer.getData('text/plain');
    if (nodeId && onNodeDrop) {
      onNodeDrop(nodeId, parentId, position);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: isOver ? 1.1 : 1 }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={cn(
        'flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer',
        isOver 
          ? 'border-primary bg-primary/20' 
          : selectedPendingNode
          ? 'border-warning bg-warning/10 hover:border-warning hover:bg-warning/20'
          : 'border-muted bg-muted/20 hover:border-muted-foreground/50'
      )}
    >
      <span className="text-xs text-muted-foreground">{position === 'left' ? 'L' : 'R'}</span>
    </motion.div>
  );
};
