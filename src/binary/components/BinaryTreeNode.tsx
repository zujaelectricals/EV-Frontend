import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BinaryNode {
  id: string;
  name: string;
  position: 'left' | 'right' | 'root';
  pv: number;
  isActive: boolean;
  children: {
    left: BinaryNode | null;
    right: BinaryNode | null;
  };
}

interface BinaryTreeNodeProps {
  node: BinaryNode;
  depth?: number;
  onNodeClick?: (node: BinaryNode) => void;
}

export const BinaryTreeNode = ({ node, depth = 0, onNodeClick }: BinaryTreeNodeProps) => {
  const hasChildren = node.children.left || node.children.right;

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: depth * 0.1, duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => onNodeClick?.(node)}
        className={cn(
          'relative cursor-pointer rounded-xl border-2 p-4 transition-all',
          node.isActive
            ? 'border-primary bg-primary/10 shadow-[0_0_20px_hsl(160_100%_50%/0.3)]'
            : 'border-muted bg-muted/50',
          node.position === 'root' && 'border-primary bg-primary/20'
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
                <BinaryTreeNode node={node.children.left} depth={depth + 1} onNodeClick={onNodeClick} />
              ) : (
                <EmptyNode position="left" />
              )}
            </div>
            <div className="flex flex-col items-center">
              {node.children.right ? (
                <BinaryTreeNode node={node.children.right} depth={depth + 1} onNodeClick={onNodeClick} />
              ) : (
                <EmptyNode position="right" />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const EmptyNode = ({ position }: { position: 'left' | 'right' }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-muted bg-muted/20"
  >
    <span className="text-xs text-muted-foreground">{position === 'left' ? 'L' : 'R'}</span>
  </motion.div>
);
