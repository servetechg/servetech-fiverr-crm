import type { Prisma } from "@prisma/client";

import { auditScopeWhere } from "@/lib/auth/audit-scope";
import { isAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { buildPaginatedResult, paginationSkip } from "@/lib/utils/pagination";
import { resolveDateRange } from "@/lib/utils/date-range";
import type { ActivityListParams } from "@/lib/validations/activities/activity-list-params";
import type { PaginatedResult } from "@/types/common/pagination";
import type { SessionUser } from "@/types/common/session-user";
import type { ActivityListItem } from "@/types/activities/activity-list-item";

function buildWhere(user: SessionUser, params: ActivityListParams): Prisma.AuditLogWhereInput {
  const scope = auditScopeWhere(user);
  const range = resolveDateRange(params.range, params.from, params.to);

  let userFilter: number | undefined;
  if (params.salespersonId) {
    if (isAdmin(user) || params.salespersonId === user.id) {
      userFilter = params.salespersonId;
    } else if (!isAdmin(user)) {
      userFilter = user.id;
    }
  }

  const where: Prisma.AuditLogWhereInput = {
    ...scope,
    ...(params.category ? { category: params.category } : {}),
    ...(userFilter ? { userId: userFilter } : {}),
    ...(params.q
      ? {
          OR: [
            { summary: { contains: params.q } },
            { details: { contains: params.q } },
            { action: { contains: params.q } },
            { entityLabel: { contains: params.q } },
            { user: { fullName: { contains: params.q } } },
            { user: { email: { contains: params.q } } },
            { lead: { leadCustomId: { contains: params.q } } },
            { lead: { clientName: { contains: params.q } } },
            { lead: { fiverrUsername: { contains: params.q } } },
          ],
        }
      : {}),
  };

  if (range.from && range.to) {
    where.createdAt = { gte: range.from, lte: range.to };
  }

  return where;
}

function mapRow(row: {
  id: number;
  userId: number;
  category: ActivityListItem["category"];
  action: string;
  summary: string;
  details: string | null;
  leadId: number | null;
  entityLabel: string | null;
  createdAt: Date;
  lead: {
    leadCustomId: string;
    clientName: string | null;
    fiverrUsername: string;
  } | null;
  user: { fullName: string; role: ActivityListItem["userRole"] };
}): ActivityListItem {
  return {
    id: row.id,
    userId: row.userId,
    repName: row.user.fullName,
    userRole: row.user.role,
    category: row.category,
    action: row.action,
    summary: row.summary,
    details: row.details,
    leadId: row.leadId,
    leadCustomId: row.lead?.leadCustomId ?? null,
    clientLabel: row.lead ? (row.lead.clientName ?? row.lead.fiverrUsername) : null,
    entityLabel: row.entityLabel,
    occurredAt: row.createdAt.toISOString(),
  };
}

export async function listActivitiesPaginated(
  user: SessionUser,
  params: ActivityListParams,
): Promise<PaginatedResult<ActivityListItem>> {
  const where = buildWhere(user, params);
  const pagination = { page: params.page, pageSize: params.pageSize };

  const [total, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: paginationSkip(pagination),
      take: params.pageSize,
      include: {
        lead: { select: { leadCustomId: true, clientName: true, fiverrUsername: true } },
        user: { select: { fullName: true, role: true } },
      },
    }),
  ]);

  return buildPaginatedResult(rows.map(mapRow), total, pagination);
}
