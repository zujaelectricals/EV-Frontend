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
  parentId?: string | null;
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
  parentId = null,
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
  const [isOver, setIsOver] = React.useState(false);
  // Allow dropping on sibling nodes (same parent, different position)
  const canDrop = onNodeDrop && draggedNodeId && draggedNodeId !== node.id && parentId && !selectedPendingNode;

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
    setIsOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (canDrop) {
      e.preventDefault();
      e.stopPropagation();
      setIsOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (canDrop && parentId) {
      e.preventDefault();
      e.stopPropagation();
      setIsOver(false);
      const nodeId = e.dataTransfer.getData('text/plain');
      if (nodeId && onNodeDrop) {
        // When dropping on a sibling node, swap positions
        // Use the target node's position - the swap logic will handle swapping with the opposite side
        const targetSide = node.position === 'left' ? 'right' : node.position === 'right' ? 'left' : 'left';
        onNodeDrop(nodeId, parentId, targetSide);
      }
    }
  };

  const nodeDelay = depth * 0.12;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } },
        hidden: {},
      }}
    >
      {/* Node */}
      <motion.div
        draggable={canDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        variants={{
          visible: {
            scale: 1,
            opacity: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: nodeDelay,
            },
          },
          hidden: { scale: 0, opacity: 0, y: 20 },
        }}
        animate={{
          scale: isDragging ? 0.92 : 1,
          opacity: isDragging ? 0.6 : 1,
          y: isDragging ? 4 : 0,
        }}
        whileHover={!isDragging ? { scale: 1.06, y: -4, transition: { duration: 0.2 } } : {}}
        whileTap={!isDragging ? { scale: 0.98, transition: { duration: 0.1 } } : {}}
        onClick={(e) => {
          e.stopPropagation();
          if (selectedPendingNode && onPositionPendingNode) {
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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative rounded-2xl border-2 p-5 min-w-[140px] transition-shadow duration-300',
          canDrag ? 'cursor-move' : 'cursor-pointer',
          node.isActive
            ? 'border-[#18b3b2]/50 bg-gradient-to-br from-white to-[#f0fdfa] shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30'
            : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-md shadow-slate-200/50 hover:shadow-lg',
          node.position === 'root' && 'border-[#18b3b2] bg-gradient-to-br from-[#f0fdfa] to-white shadow-xl shadow-emerald-500/25 ring-2 ring-[#18b3b2]/20',
          isDragging && 'z-50',
          selectedPendingNode && 'ring-2 ring-amber-400 ring-offset-2',
          isOver && canDrop && 'ring-2 ring-[#18b3b2] bg-[#18b3b2]/10'
        )}
      >
        {/* Subtle pulse for root */}
        {node.position === 'root' && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-[#18b3b2]/10 pointer-events-none"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div className="relative flex flex-col items-center gap-3">
          <motion.div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full',
              node.isActive
                ? 'bg-gradient-to-br from-[#18b3b2]/25 to-[#22cc7b]/25'
                : 'bg-slate-100'
            )}
            whileHover={{ scale: 1.12, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <User className={cn('h-7 w-7', node.isActive ? 'text-[#0d9488]' : 'text-slate-500')} />
          </motion.div>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground tracking-tight">{node.name}</p>
          </div>
          <motion.span
            className={cn(
              'absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm',
              node.isActive ? 'bg-gradient-to-br from-[#18b3b2] to-[#22cc7b]' : 'bg-slate-400'
            )}
            animate={node.isActive ? { scale: [1, 1.15, 1], opacity: [1, 0.9, 1] } : {}}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      {/* Connector lines */}
      {hasChildren && (
        <>
          <motion.div
            className="h-7 w-0.5 bg-gradient-to-b from-[#18b3b2]/60 to-[#18b3b2]/20 rounded-full origin-top"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: nodeDelay + 0.1, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <div className="flex">
            {/* Left branch */}
            <div className="flex flex-col items-center">
              <motion.div
                className="h-0.5 w-20 bg-gradient-to-r from-[#18b3b2]/20 via-[#18b3b2]/50 to-transparent rounded-full origin-right"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: nodeDelay + 0.2, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
              <motion.div
                className="h-7 w-0.5 bg-gradient-to-b from-[#18b3b2]/60 to-[#18b3b2]/20 rounded-full origin-top"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: nodeDelay + 0.3, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>
            {/* Right branch */}
            <div className="flex flex-col items-center">
              <motion.div
                className="h-0.5 w-20 bg-gradient-to-l from-[#18b3b2]/20 via-[#18b3b2]/50 to-transparent rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: nodeDelay + 0.2, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
              <motion.div
                className="h-7 w-0.5 bg-gradient-to-b from-[#18b3b2]/60 to-[#18b3b2]/20 rounded-full origin-top"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: nodeDelay + 0.3, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>
          </div>

          {/* Children */}
          <motion.div className="flex gap-8" variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}>
            <div className="flex flex-col items-center">
              {node.children.left ? (
                <BinaryTreeNode 
                  node={node.children.left} 
                  depth={depth + 1}
                  parentId={node.id}
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
                  parentId={node.id}
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
          </motion.div>
        </>
      )}
    </motion.div>
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
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isOver ? 1.08 : 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.15 }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.95 }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={cn(
        'flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed transition-colors duration-200 cursor-pointer',
        isOver
          ? 'border-[#18b3b2] bg-gradient-to-br from-[#18b3b2]/20 to-[#22cc7b]/15 shadow-lg shadow-emerald-500/20'
          : selectedPendingNode
          ? 'border-amber-400/60 bg-amber-50/50 hover:border-amber-400 hover:bg-amber-50'
          : 'border-slate-200 bg-slate-50/80 hover:border-[#18b3b2]/40 hover:bg-[#f0fdfa]/50'
      )}
    >
      <motion.span
        className={cn(
          'text-sm font-bold',
          isOver ? 'text-[#0d9488]' : selectedPendingNode ? 'text-amber-600' : 'text-slate-400'
        )}
        animate={isOver ? { scale: [1, 1.2, 1], transition: { duration: 0.6, repeat: Infinity } } : {}}
      >
        {position === 'left' ? 'L' : 'R'}
      </motion.span>
    </motion.div>
  );
};
