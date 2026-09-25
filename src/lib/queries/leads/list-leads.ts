import type { Prisma } from "@prisma/client";
import { format } from "date-fns";

import { DEFAULT_LEAD_PAGE_SIZE } from "@/lib/constants/lead-pagination";
import { leadScopeWhere } from "@/lib/auth/lead-scope";
import { isAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { buildPaginatedResult, paginationSkip } from "@/lib/utils/pagination";
import { resolveDateRange } from "@/lib/utils/date-range";
import type { LeadListParams } from "@/lib/validations/leads/lead-list-params";
import type { PaginatedResult } from "@/types/common/pagination";
import type { SessionUser } from "@/types/common/session-user";
import type { LeadListItem } from "@/types/leads/lead-list-item";
import { parseLostChatProof } from "@/types/leads/lost-chat-proof";

function buildLeadListWhere(user: SessionUser, params: LeadListParams): Prisma.LeadWhereInput {
  const range = resolveDateRange(params.range, params.from, params.to);
  const scope = leadScopeWhere(user);

  let salespersonFilter: number | undefined;
  if (params.salespersonId) {
    if (isAdmin(user) || params.salespersonId === user.id) {
      salespersonFilter = params.salespersonId;
    } else if (!isAdmin(user)) {
      salespersonFilter = user.id;
    }
  }

  const where: Prisma.LeadWhereInput = {
    ...scope,
    ...(params.status ? { status: params.status } : {}),
    ...(params.priority ? { priority: params.priority } : {}),
    ...(params.fiverrAccountId ? { fiverrAccountId: params.fiverrAccountId } : {}),
    ...(params.serviceId ? { serviceId: params.serviceId } : {}),
    ...(salespersonFilter ? { salespersonId: salespersonFilter } : {}),
    ...(params.q
      ? {
          OR: [
            { leadCustomId: { contains: params.q } },
            { clientName: { contains: params.q } },
            { fiverrUsername: { contains: params.q } },
          ],
        }
      : {}),
  };

  if (range.from && range.to) {
    where.dateReceived = { gte: range.from, lte: range.to };
  }

  return where;
}

function mapLeadRow(row: {
  id: number;
  leadCustomId: string;
  dateReceived: Date;
  clientName: string | null;
  fiverrUsername: string;
  fiverrAccountId: number;
  salespersonId: number;
  serviceId: number;
  status: LeadListItem["status"];
  priority: LeadListItem["priority"];
  estProjectValue: { toString(): string };
  actualRevenue: { toString(): string };
  orders: { frontRevenue: { toString(): string } }[];
  lostChatProof: unknown;
  fiverrAccount: { accountName: string };
  salesperson: { fullName: string; email: string };
  service: { serviceName: string };
}): LeadListItem {
  return {
    id: row.id,
    leadCustomId: row.leadCustomId,
    dateReceived: format(row.dateReceived, "yyyy-MM-dd"),
    clientName: row.clientName,
    fiverrUsername: row.fiverrUsername,
    fiverrAccountId: row.fiverrAccountId,
    fiverrAccountName: row.fiverrAccount.accountName,
    salespersonId: row.salespersonId,
    salespersonName: row.salesperson.fullName,
    salespersonEmail: row.salesperson.email,
    serviceId: row.serviceId,
    serviceName: row.service.serviceName,
    status: row.status,
    priority: row.priority,
    estProjectValue: Number(row.estProjectValue),
    revenue: row.orders[0] ? Number(row.orders[0].frontRevenue) : Number(row.actualRevenue),
    lostChatProof: parseLostChatProof(row.lostChatProof),
  };
}

const leadListInclude = {
  fiverrAccount: { select: { accountName: true } },
  salesperson: { select: { fullName: true, email: true } },
  service: { select: { serviceName: true } },
  orders: {
    orderBy: { createdAt: "asc" as const },
    take: 1,
    select: { frontRevenue: true },
  },
} as const;

export async function listLeads(
  user: SessionUser,
  params: LeadListParams,
): Promise<PaginatedResult<LeadListItem>> {
  const where = buildLeadListWhere(user, params);
  const pagination = { page: params.page, pageSize: params.pageSize };

  const [total, rows] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: leadListInclude,
      orderBy: [{ dateReceived: "desc" }, { id: "desc" }],
      skip: paginationSkip(pagination),
      take: params.pageSize,
    }),
  ]);

  return buildPaginatedResult(rows.map(mapLeadRow), total, pagination);
}

export type LeadExportRow = LeadListItem & {
  chatLink: string | null;
  followUpDate: string | null;
  clientRequirement: string | null;
  internalNotes: string | null;
  lostReason: string | null;
};

export async function listLeadsForExport(
  user: SessionUser,
  params: Omit<LeadListParams, "page" | "pageSize">,
): Promise<LeadExportRow[]> {
  const where = buildLeadListWhere(user, { ...params, page: 1, pageSize: DEFAULT_LEAD_PAGE_SIZE });
  const rows = await prisma.lead.findMany({
    where,
    include: leadListInclude,
    orderBy: [{ dateReceived: "desc" }, { id: "desc" }],
    take: 10_000,
  });
  return rows.map((row) => ({
    ...mapLeadRow(row),
    chatLink: row.chatLink,
    followUpDate: row.followUpDate ? format(row.followUpDate, "yyyy-MM-dd") : null,
    clientRequirement: row.clientRequirement,
    internalNotes: row.internalNotes,
    lostReason: row.lostReason,
  }));
}
