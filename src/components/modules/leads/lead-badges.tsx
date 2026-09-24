import type { LeadPriority, LeadStatus } from "@prisma/client";

import { LEAD_PRIORITY_LABELS, LEAD_STATUS_LABELS } from "@/lib/constants/leads";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Partial<Record<LeadStatus, string>> = {
  NewMessage: "bg-sky-500/15 text-sky-900 dark:text-sky-100",
  OrderReceived: "bg-[#C3F53C]/25 text-foreground",
  Completed: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-100",
  Lost: "bg-destructive/15 text-destructive",
};

const PRIORITY_STYLES: Record<LeadPriority, string> = {
  Hot: "bg-orange-500/15 text-orange-900 dark:text-orange-100",
  Warm: "bg-amber-500/15 text-amber-900 dark:text-amber-100",
  Cold: "bg-slate-500/15 text-slate-800 dark:text-slate-100",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}

export function LeadPriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        PRIORITY_STYLES[priority],
      )}
    >
      {LEAD_PRIORITY_LABELS[priority]}
    </span>
  );
}
