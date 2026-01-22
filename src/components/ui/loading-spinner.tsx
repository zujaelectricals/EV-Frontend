import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /**
   * Optional text to display below the loading animation
   */
  text?: string;
  /**
   * Size of the loading spinner: 'sm', 'md', or 'lg'
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Whether to show the text
   * @default true
   */
  showText?: boolean;
}

const sizeClasses = {
  sm: {
    container: 'h-8',
    dot: 'h-2 w-2',
    gap: 'gap-1.5',
    text: 'text-xs',
  },
  md: {
    container: 'h-12',
    dot: 'h-3 w-3',
    gap: 'gap-2',
    text: 'text-sm',
  },
  lg: {
    container: 'h-16',
    dot: 'h-4 w-4',
    gap: 'gap-2.5',
    text: 'text-base',
  },
};

export function LoadingSpinner({ 
  text, 
  size = 'md', 
  className,
  showText = true 
}: LoadingSpinnerProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("flex items-center justify-center", sizes.container)}>
        <div className={cn("flex items-center", sizes.gap)}>
          <div
            className={cn(
              "rounded-full bg-primary loading-dot",
              sizes.dot
            )}
            style={{
              animationDelay: '0s',
            }}
          />
          <div
            className={cn(
              "rounded-full bg-primary loading-dot",
              sizes.dot
            )}
            style={{
              animationDelay: '0.2s',
            }}
          />
          <div
            className={cn(
              "rounded-full bg-primary loading-dot",
              sizes.dot
            )}
            style={{
              animationDelay: '0.4s',
            }}
          />
        </div>
      </div>
      {showText && text && (
        <p className={cn("mt-3 text-muted-foreground", sizes.text)}>
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * Inline loading spinner for use within text or small spaces
 */
export function InlineLoadingSpinner({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span
        className="inline-block h-1.5 w-1.5 rounded-full bg-current loading-dot-inline"
        style={{
          animationDelay: '0s',
        }}
      />
      <span
        className="inline-block h-1.5 w-1.5 rounded-full bg-current loading-dot-inline"
        style={{
          animationDelay: '0.2s',
        }}
      />
      <span
        className="inline-block h-1.5 w-1.5 rounded-full bg-current loading-dot-inline"
        style={{
          animationDelay: '0.4s',
        }}
      />
    </span>
  );
}

