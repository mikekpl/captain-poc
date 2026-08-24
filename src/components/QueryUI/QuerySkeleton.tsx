import { Skeleton } from "@/src/components/ui/skeleton";

export function QuerySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top answer shimmer */}
      <div className="rounded-xl border-2 border-blue-100 bg-blue-50 p-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
      </div>
      {/* Results list shimmer */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
