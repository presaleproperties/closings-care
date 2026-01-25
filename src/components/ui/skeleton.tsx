import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted/60",
        className
      )} 
      {...props}
    >
      {/* Premium shimmer effect */}
      <div 
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(var(--muted) / 0.8) 20%, hsl(var(--background) / 0.6) 50%, hsl(var(--muted) / 0.8) 80%, transparent 100%)',
        }}
      />
    </div>
  );
}

// Premium card skeleton with rich depth
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card/98 backdrop-blur-xl border border-border/40 p-5",
        className
      )}
      style={{
        boxShadow: `
          0 0 0 1px hsl(var(--border) / 0.25),
          0 2px 4px 0 hsl(220 25% 10% / 0.04),
          0 4px 8px -2px hsl(220 25% 10% / 0.06)
        `,
      }}
      {...props}
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// Premium KPI/stat skeleton
function SkeletonKPI({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'primary' | 'accent' }) {
  const isPrimary = variant === 'primary';
  const isAccent = variant === 'accent';
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl p-5",
        isPrimary || isAccent ? "" : "bg-card/98 backdrop-blur-xl border border-border/40",
        className
      )}
      style={isPrimary ? {
        background: 'linear-gradient(145deg, hsl(158 64% 36% / 0.15) 0%, hsl(158 64% 28% / 0.1) 100%)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 4px 12px -2px hsl(158 64% 32% / 0.15)',
      } : isAccent ? {
        background: 'linear-gradient(145deg, hsl(38 75% 55% / 0.15) 0%, hsl(32 85% 48% / 0.1) 100%)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 4px 12px -2px hsl(38 75% 50% / 0.15)',
      } : {
        boxShadow: `
          0 0 0 1px hsl(var(--border) / 0.25),
          0 2px 4px 0 hsl(220 25% 10% / 0.04),
          0 4px 8px -2px hsl(220 25% 10% / 0.06)
        `,
      }}
      {...props}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className={cn("h-4 w-4 rounded-lg", isPrimary && "bg-primary/20", isAccent && "bg-accent/20")} />
          <Skeleton className={cn("h-3 w-20", isPrimary && "bg-primary/20", isAccent && "bg-accent/20")} />
        </div>
        <Skeleton className={cn("h-9 w-28", isPrimary && "bg-primary/25", isAccent && "bg-accent/25")} />
        <Skeleton className={cn("h-3 w-16", isPrimary && "bg-primary/15", isAccent && "bg-accent/15")} />
      </div>
    </div>
  );
}

// Premium list item skeleton
function SkeletonListItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 border-b border-border/30 last:border-0",
        className
      )}
      {...props}
    >
      <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

// Premium chart skeleton
function SkeletonChart({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card/98 backdrop-blur-xl border border-border/40 p-6",
        className
      )}
      style={{
        boxShadow: `
          0 0 0 1px hsl(var(--border) / 0.25),
          0 2px 4px 0 hsl(220 25% 10% / 0.04),
          0 4px 8px -2px hsl(220 25% 10% / 0.06)
        `,
      }}
      {...props}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="flex items-end gap-2 h-48 pt-4">
          {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.45, 0.75, 0.55, 0.85, 0.5, 0.7].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <Skeleton 
                className="w-full rounded-t-md" 
                style={{ height: `${height * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-2">
          {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((_, i) => (
            <Skeleton key={i} className="h-3 w-4" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Premium table skeleton
function SkeletonTable({ rows = 5, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { rows?: number }) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card/98 backdrop-blur-xl border border-border/40",
        className
      )}
      style={{
        boxShadow: `
          0 0 0 1px hsl(var(--border) / 0.25),
          0 2px 4px 0 hsl(220 25% 10% / 0.04),
          0 4px 8px -2px hsl(220 25% 10% / 0.06)
        `,
      }}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border/50 bg-muted/30">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16 ml-auto" />
        <Skeleton className="h-3 w-20" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border/30 last:border-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full ml-auto" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

// Dashboard skeleton - complete layout
function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-4 lg:p-6 animate-fade-in">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="col-span-2 lg:col-span-1">
          <SkeletonKPI variant="primary" />
        </div>
        <SkeletonKPI variant="accent" />
        <SkeletonKPI />
        <SkeletonKPI className="col-span-2 lg:col-span-1" />
      </div>
      
      {/* Chart */}
      <SkeletonChart />
      
      {/* List Section */}
      <div className="rounded-2xl bg-card/98 backdrop-blur-xl border border-border/40 overflow-hidden"
        style={{
          boxShadow: `
            0 0 0 1px hsl(var(--border) / 0.25),
            0 2px 4px 0 hsl(220 25% 10% / 0.04),
            0 4px 8px -2px hsl(220 25% 10% / 0.06)
          `,
        }}
      >
        <div className="px-5 py-4 border-b border-border/50">
          <Skeleton className="h-5 w-36" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonKPI, 
  SkeletonListItem, 
  SkeletonChart, 
  SkeletonTable,
  SkeletonDashboard 
};
