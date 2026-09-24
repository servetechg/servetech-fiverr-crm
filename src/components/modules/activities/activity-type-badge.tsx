import type { ActivityType } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { ACTIVITY_TYPE_LABELS } from "@/lib/constants/activities";
import { cn } from "cn";

const TYPE_STYLES: Partial<Record<ActivityType, string>> = {
  ClientMessage: "bg-sky-100 text-sky-900 border-sky-200",
  SalesReply: "bg-slate-100 text-slate-800 border-slate-200",
  QuoteSent: "bg-amber-100 text-amber-900 border-amber-200",
  OrderReceived: "bg-emerald-100 text-emerald-900 border-emerald-200",
  OrderCancelled: "bg-slate-100 text-slate-700 border-slate-200",
  Lost: "bg-red-100 text-red-900 border-red-200",
};

type ActivityTypeBadgeProps = {
  type: ActivityType;
};

export function ActivityTypeBadge({ type }: ActivityTypeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-normal", TYPE_STYLES[type] ?? "bg-muted/60 text-foreground")}
    >
      {ACTIVITY_TYPE_LABELS[type]}
    </Badge>
  );
}
