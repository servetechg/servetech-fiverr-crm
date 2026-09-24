import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ActiveStatusBadgeProps = {
  isActive: boolean;
  className?: string;
};

export function ActiveStatusBadge({ isActive, className }: ActiveStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border-transparent font-medium",
        isActive ? "bg-primary/25 text-foreground" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
