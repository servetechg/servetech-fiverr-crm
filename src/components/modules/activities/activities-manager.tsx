"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Activity, Shield, UserRound } from "lucide-react";

import { ActivitiesFilters } from "@/components/modules/activities/activities-filters";
import { AuditCategoryBadge } from "@/components/modules/activities/audit-category-badge";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { ListPagination } from "@/components/shared/list-pagination";
import { Badge } from "@/components/ui/badge";
import type { PaginatedResult } from "@/types/common/pagination";
import type { SessionUser } from "@/types/common/session-user";
import type { ActivityFilterOptions, ActivityListItem } from "@/types/activities/activity-list-item";
import { cn } from "@/lib/utils/cn";

type ActivitiesManagerProps = {
  user: SessionUser;
  data: PaginatedResult<ActivityListItem>;
  filterOptions: ActivityFilterOptions;
};

function UserCell({ item }: { item: ActivityListItem }) {
  const isAdmin = item.userRole === "Admin";
  return (
    <div className="flex min-w-[8.5rem] flex-col gap-1">
      <span className="font-medium text-foreground">{item.repName}</span>
      <Badge
        variant="outline"
        className={cn(
          "w-fit gap-1 rounded-full px-2 py-0 text-[0.65rem] font-medium uppercase tracking-wide",
          isAdmin
            ? "border-[#c3f53c]/35 bg-[rgb(195_245_60/0.12)] text-foreground"
            : "border-border/80 bg-muted/40 text-muted-foreground",
        )}
      >
        {isAdmin ? <Shield className="size-3" /> : <UserRound className="size-3" />}
        {isAdmin ? "Admin" : "Sales"}
      </Badge>
    </div>
  );
}

function EventCell({ item }: { item: ActivityListItem }) {
  return (
    <div className="min-w-[12rem] max-w-md space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <AuditCategoryBadge category={item.category} />
        <span className="text-sm font-medium text-foreground">{item.summary}</span>
      </div>
      {item.details ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.details}</p>
      ) : null}
    </div>
  );
}

function RelatedCell({ item }: { item: ActivityListItem }) {
  if (item.leadId && item.leadCustomId) {
    return (
      <Link
        href={`/leads/${item.leadId}`}
        className="block min-w-[7rem] text-sm hover:underline"
      >
        <span className="font-medium text-foreground">{item.leadCustomId}</span>
        {item.clientLabel ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">{item.clientLabel}</span>
        ) : null}
      </Link>
    );
  }
  if (item.entityLabel) {
    return <span className="text-sm text-foreground">{item.entityLabel}</span>;
  }
  return <span className="text-sm text-muted-foreground">—</span>;
}

export function ActivitiesManager({ user, data, filterOptions }: ActivitiesManagerProps) {
  void user;

  const columns = useMemo<ColumnDef<ActivityListItem, unknown>[]>(
    () => [
      {
        id: "when",
        header: "When",
        cell: ({ row }) => {
          const at = new Date(row.original.occurredAt);
          return (
            <div className="min-w-[7.5rem] whitespace-nowrap">
              <p className="text-sm font-medium text-foreground">
                {formatDistanceToNow(at, { addSuffix: true })}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(at, "MMM d, yyyy · HH:mm")}
              </p>
            </div>
          );
        },
      },
      {
        id: "user",
        header: "User",
        cell: ({ row }) => <UserCell item={row.original} />,
      },
      {
        id: "event",
        header: "Event",
        cell: ({ row }) => <EventCell item={row.original} />,
      },
      {
        id: "related",
        header: "Related",
        cell: ({ row }) => <RelatedCell item={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity log"
        description="Full audit trail — sign-ins, lead changes, follow-ups, admin setup, and data import/export."
      />

      <div className="glass-surface flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgb(195_245_60/0.16)] text-[#9acc2a]">
            <Activity className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">System-wide monitoring</p>
            <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
              Every meaningful action in the CRM is captured automatically. Admins see all events;
              salespeople see their own actions and activity on their assigned leads.
            </p>
          </div>
        </div>
        <p className="shrink-0 text-sm text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">{data.total}</span>{" "}
          {data.total === 1 ? "event" : "events"}
        </p>
      </div>

      <div className="space-y-3">
        <ActivitiesFilters user={user} filterOptions={filterOptions} />
      </div>

      <DataTableShell
        columns={columns}
        data={data.items}
        emptyMessage="No events yet. Sign in or perform actions in the CRM to build the audit trail."
      />
      <ListPagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        entitySingular="event"
      />
    </div>
  );
}
