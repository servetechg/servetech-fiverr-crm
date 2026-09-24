import { Skeleton } from "@/components/ui/skeleton";

export function LeadsTableFallback() {
  return (
    <div className="space-y-4">
      <div className="data-table-panel overflow-hidden p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-32 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
