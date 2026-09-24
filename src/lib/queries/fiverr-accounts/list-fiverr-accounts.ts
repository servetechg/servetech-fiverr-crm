import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { buildPaginatedResult, paginationSkip } from "@/lib/utils/pagination";
import type { FiverrAccountListParams } from "@/lib/validations/fiverr-accounts/account-list-params";
import type { PaginatedResult } from "@/types/common/pagination";
import type { FiverrAccountListItem } from "@/types/fiverr-accounts/account-list-item";
import type { FiverrAccountOption } from "@/types/sales-team/user-list-item";

function buildWhere(params: FiverrAccountListParams): Prisma.FiverrAccountWhereInput {
  const where: Prisma.FiverrAccountWhereInput = {};

  if (params.status === "active") {
    where.isActive = true;
  } else if (params.status === "inactive") {
    where.isActive = false;
  }

  if (params.q) {
    where.OR = [
      { accountName: { contains: params.q } },
      { accountOwner: { contains: params.q } },
      { assignedTeam: { contains: params.q } },
    ];
  }

  return where;
}

function mapRow(row: {
  id: number;
  accountName: string;
  accountOwner: string | null;
  assignedTeam: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  _count: { leads: number };
}): FiverrAccountListItem {
  return {
    id: row.id,
    accountName: row.accountName,
    accountOwner: row.accountOwner,
    assignedTeam: row.assignedTeam,
    notes: row.notes,
    isActive: row.isActive,
    leadCount: row._count.leads,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listFiverrAccountsPaginated(
  params: FiverrAccountListParams,
): Promise<PaginatedResult<FiverrAccountListItem>> {
  const where = buildWhere(params);
  const pagination = { page: params.page, pageSize: params.pageSize };

  const [total, rows] = await Promise.all([
    prisma.fiverrAccount.count({ where }),
    prisma.fiverrAccount.findMany({
      where,
      orderBy: { accountName: "asc" },
      skip: paginationSkip(pagination),
      take: params.pageSize,
      include: { _count: { select: { leads: true } } },
    }),
  ]);

  return buildPaginatedResult(rows.map(mapRow), total, pagination);
}

export async function listFiverrAccountOptions(): Promise<FiverrAccountOption[]> {
  const rows = await prisma.fiverrAccount.findMany({
    where: { isActive: true },
    orderBy: { accountName: "asc" },
    select: { id: true, accountName: true },
  });
  return rows;
}
