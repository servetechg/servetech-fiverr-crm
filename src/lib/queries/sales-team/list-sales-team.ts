import type { Prisma, UserRole } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { buildPaginatedResult, paginationSkip } from "@/lib/utils/pagination";
import type { SalesTeamListParams } from "@/lib/validations/sales-team/sales-team-list-params";
import type { PaginatedResult } from "@/types/common/pagination";
import type { SalesTeamListItem } from "@/types/sales-team/user-list-item";

function buildWhere(params: SalesTeamListParams): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (params.role !== "all") {
    where.role = params.role as UserRole;
  }

  if (params.status === "active") {
    where.isActive = true;
  } else if (params.status === "inactive") {
    where.isActive = false;
  }

  if (params.q) {
    where.OR = [{ fullName: { contains: params.q } }, { email: { contains: params.q } }];
  }

  return where;
}

function mapRow(row: {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  monthlyTarget: { toString(): string };
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  assignedFiverrAccounts: { fiverrAccountId: number; fiverrAccount: { accountName: string } }[];
}): SalesTeamListItem {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    role: row.role,
    monthlyTarget: Number(row.monthlyTarget),
    isActive: row.isActive,
    assignedAccountNames: row.assignedFiverrAccounts.map((link) => link.fiverrAccount.accountName),
    assignedFiverrAccountIds: row.assignedFiverrAccounts.map((link) => link.fiverrAccountId),
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listSalesTeamPaginated(
  params: SalesTeamListParams,
): Promise<PaginatedResult<SalesTeamListItem>> {
  const where = buildWhere(params);
  const pagination = { page: params.page, pageSize: params.pageSize };

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ role: "asc" }, { fullName: "asc" }],
      skip: paginationSkip(pagination),
      take: params.pageSize,
      include: {
        assignedFiverrAccounts: {
          include: { fiverrAccount: { select: { accountName: true } } },
          orderBy: { fiverrAccountId: "asc" },
        },
      },
    }),
  ]);

  return buildPaginatedResult(rows.map(mapRow), total, pagination);
}
