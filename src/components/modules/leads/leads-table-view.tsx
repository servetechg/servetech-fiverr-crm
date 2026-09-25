"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { useLeadsActions } from "@/components/modules/leads/leads-actions-context";
import { ChatProofTableCell } from "@/components/modules/leads/chat-proof-table-cell";
import { LeadPriorityBadge, LeadStatusBadge } from "@/components/modules/leads/lead-badges";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { ListPagination } from "@/components/shared/list-pagination";
import { RowActions } from "@/components/shared/row-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LEAD_PAGE_SIZE_OPTIONS } from "@/lib/constants/lead-pagination";
import { formatCurrency } from "@/lib/utils/format";
import { canDeleteLead, canMutateLead } from "@/lib/auth/lead-scope";
import type { PaginatedResult } from "@/types/common/pagination";
import type { SessionUser } from "@/types/common/session-user";
import type { LeadListItem } from "@/types/leads/lead-list-item";

type LeadsTableViewProps = {
  data: PaginatedResult<LeadListItem>;
  user: SessionUser;
};

function clientInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ClientCell({ item }: { item: LeadListItem }) {
  const display = item.clientName ?? item.fiverrUsername;
  return (
    <div className="flex min-w-[10rem] items-center gap-3">
      <Avatar size="sm">
        <AvatarFallback className="bg-primary/20 text-[10px] font-semibold text-foreground">
          {clientInitials(display)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{display}</p>
        {item.clientName ? (
          <p className="truncate text-xs text-muted-foreground">@{item.fiverrUsername}</p>
        ) : null}
      </div>
    </div>
  );
}

export function LeadsTableView({ data, user }: LeadsTableViewProps) {
  const { onEdit, onDelete } = useLeadsActions();
  const adminCanDelete = canDeleteLead(user);

  const columns = useMemo<ColumnDef<LeadListItem, unknown>[]>(
    () => [
      {
        accessorKey: "leadCustomId",
        header: "Lead ID",
        cell: ({ row }) => (
          <Link
            href={`/leads/${row.original.id}`}
            className="font-medium text-foreground hover:text-foreground/80 hover:underline"
          >
            {row.original.leadCustomId}
          </Link>
        ),
      },
      {
        accessorKey: "dateReceived",
        header: "Date",
      },
      {
        id: "client",
        header: "Client",
        cell: ({ row }) => <ClientCell item={row.original} />,
      },
      {
        accessorKey: "fiverrAccountName",
        header: "Account",
        cell: ({ row }) => (
          <span className="inline-block max-w-[12rem] truncate">{row.original.fiverrAccountName}</span>
        ),
      },
      {
        accessorKey: "salespersonName",
        header: "Rep",
        cell: ({ row }) => (
          <span className="inline-block max-w-[10rem] truncate">{row.original.salespersonName}</span>
        ),
      },
      {
        accessorKey: "serviceName",
        header: "Service",
        cell: ({ row }) => (
          <span className="inline-block max-w-[14rem] truncate">{row.original.serviceName}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <LeadStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => <LeadPriorityBadge priority={row.original.priority} />,
      },
      {
        accessorKey: "estProjectValue",
        header: "Est. value",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{formatCurrency(row.original.estProjectValue)}</span>
        ),
      },
      {
        accessorKey: "revenue",
        header: "Revenue",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{formatCurrency(row.original.revenue)}</span>
        ),
      },
      {
        id: "chatProof",
        header: "Chat proof",
        cell: ({ row }) => (
          <ChatProofTableCell
            proof={row.original.lostChatProof}
            leadCustomId={row.original.leadCustomId}
            clientLabel={row.original.clientName ?? row.original.fiverrUsername}
          />
        ),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <RowActions
            detailHref={`/leads/${row.original.id}`}
            onEdit={() => onEdit(row.original.id)}
            onDelete={adminCanDelete ? () => onDelete(row.original) : undefined}
            showEdit={canMutateLead(user, row.original.salespersonId)}
            showDelete={adminCanDelete}
          />
        ),
      },
    ],
    [adminCanDelete, onDelete, onEdit, user],
  );

  return (
    <DataTableShell
      columns={columns}
      data={data.items}
      stickyColumnIds={["actions"]}
      emptyMessage="No leads match your filters."
      footer={
        <ListPagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          pageSize={data.pageSize}
          pageSizeOptions={LEAD_PAGE_SIZE_OPTIONS}
          entitySingular="lead"
        />
      }
    />
  );
}
