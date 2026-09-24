import type { Prisma } from "@prisma/client";

import { activityScopeWhere } from "@/lib/auth/activity-scope";
import { isAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { buildPaginatedResult, paginationSkip } from "@/lib/utils/pagination";
import { resolveDateRange } from "@/lib/utils/date-range";
import type { ActivityListParams } from "@/lib/validations/activities/activity-list-params";
import type { PaginatedResult } from "@/types/common/pagination";
import type { SessionUser } from "@/types/common/session-user";
import type { ActivityListItem } from "@/types/activities/activity-list-item";

function buildWhere(user: SessionUser, params: ActivityListParams): Prisma.ActivityWhereInput {
  const scope = activityScopeWhere(user);
  const range = resolveDateRange(params.range, params.from, params.to);

  let salespersonFilter: number | undefined;
  if (params.salespersonId) {
    if (isAdmin(user) || params.salespersonId === user.id) {
      salespersonFilter = params.salespersonId;
    } else if (!isAdmin(user)) {
      salespersonFilter = user.id;
    }
  }

  const where: Prisma.ActivityWhereInput = {
    ...scope,
    ...(params.type ? { activityType: params.type } : {}),
    ...(params.direction ? { direction: params.direction } : {}),
    ...(salespersonFilter ? { userId: salespersonFilter } : {}),
    ...(params.q
      ? {
          OR: [
            { notes: { contains: params.q } },
            { messageCategory: { contains: params.q } },
            { actionTaken: { contains: params.q } },
            { lead: { leadCustomId: { contains: params.q } } },
            { lead: { clientName: { contains: params.q } } },
            { lead: { fiverrUsername: { contains: params.q } } },
          ],
        }
      : {}),
  };

  if (range.from && range.to) {
    where.activityTime = { gte: range.from, lte: range.to };
  }

  return where;
}

function mapRow(row: {
  id: number;
  leadId: number;
  userId: number;
  activityType: ActivityListItem["activityType"];
  direction: ActivityListItem["direction"];
  responseTimeMinutes: number | null;
  messageCategory: string | null;
  actionTaken: string | null;
  upsellMentioned: boolean;
  notes: string;
  activityTime: Date;
  lead: { leadCustomId: string; clientName: string | null; fiverrUsername: string };
  user: { fullName: string };
}): ActivityListItem {
  return {
    id: row.id,
    leadId: row.leadId,
    leadCustomId: row.lead.leadCustomId,
    clientLabel: row.lead.clientName ?? row.lead.fiverrUsername,
    userId: row.userId,
    repName: row.user.fullName,
    activityType: row.activityType,
    direction: row.direction,
    responseTimeMinutes: row.responseTimeMinutes,
    messageCategory: row.messageCategory,
    actionTaken: row.actionTaken,
    upsellMentioned: row.upsellMentioned,
    notes: row.notes,
    activityTime: row.activityTime.toISOString(),
  };
}

export async function listActivitiesPaginated(
  user: SessionUser,
  params: ActivityListParams,
): Promise<PaginatedResult<ActivityListItem>> {
  const where = buildWhere(user, params);
  const pagination = { page: params.page, pageSize: params.pageSize };

  const [total, rows] = await Promise.all([
    prisma.activity.count({ where }),
    prisma.activity.findMany({
      where,
      orderBy: [{ activityTime: "desc" }, { id: "desc" }],
      skip: paginationSkip(pagination),
      take: params.pageSize,
      include: {
        lead: { select: { leadCustomId: true, clientName: true, fiverrUsername: true } },
        user: { select: { fullName: true } },
      },
    }),
  ]);

  return buildPaginatedResult(rows.map(mapRow), total, pagination);
}
