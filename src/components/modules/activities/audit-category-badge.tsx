import type { AuditCategory } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { AUDIT_CATEGORY_LABELS } from "@/lib/constants/audit";
import { cn } from "@/lib/utils/cn";

const CATEGORY_STYLES: Partial<Record<AuditCategory, string>> = {
  Auth: "bg-indigo-100 text-indigo-900 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200",
  Lead: "bg-sky-100 text-sky-900 border-sky-200",
  FollowUp: "bg-violet-100 text-violet-900 border-violet-200",
  Order: "bg-emerald-100 text-emerald-900 border-emerald-200",
  FiverrAccount: "bg-amber-100 text-amber-900 border-amber-200",
  Team: "bg-rose-100 text-rose-900 border-rose-200",
  Service: "bg-teal-100 text-teal-900 border-teal-200",
  Data: "bg-orange-100 text-orange-900 border-orange-200",
  System: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-200",
};

type AuditCategoryBadgeProps = {
  category: AuditCategory;
};

export function AuditCategoryBadge({ category }: AuditCategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-normal",
        CATEGORY_STYLES[category] ?? "bg-muted/60 text-foreground",
      )}
    >
      {AUDIT_CATEGORY_LABELS[category]}
    </Badge>
  );
}
