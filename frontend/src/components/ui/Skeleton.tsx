

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-studio-sidebar border border-studio-border/30 rounded ${className}`} />
  );
}

export function SkeletonRow() {
  return (
    <div className="py-3 px-4 flex items-center justify-between border-b border-studio-border last:border-0">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="border border-studio-border rounded-lg bg-white overflow-hidden space-y-3 p-4">
      <div className="flex justify-between items-center pb-2 border-b border-studio-border">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="space-y-2.5 pt-2">
        <div className="grid grid-cols-12 gap-2">
          <Skeleton className="col-span-3 h-8" />
          <Skeleton className="col-span-1 h-8" />
          <div className="col-span-7 grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
          <Skeleton className="col-span-1 h-8" />
        </div>
        <div className="grid grid-cols-12 gap-2">
          <Skeleton className="col-span-3 h-8" />
          <Skeleton className="col-span-1 h-8" />
          <div className="col-span-7 grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
          <Skeleton className="col-span-1 h-8" />
        </div>
      </div>
    </div>
  );
}
