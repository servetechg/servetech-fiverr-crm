import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { buildPaginatedResult, paginationSkip } from "@/lib/utils/pagination";
import type { ServiceListParams } from "@/lib/validations/services/service-list-params";
import type { PaginatedResult } from "@/types/common/pagination";
import type { ServiceListItem } from "@/types/services/service-list-item";

function buildWhere(params: ServiceListParams): Prisma.ServiceWhereInput {
  const where: Prisma.ServiceWhereInput = {};

  if (params.status === "active") {
    where.isActive = true;
  } else if (params.status === "inactive") {
    where.isActive = false;
  }

  if (params.q) {
    where.serviceName = { contains: params.q };
  }

  return where;
}

function mapRow(row: {
  id: number;
  serviceName: string;
  isActive: boolean;
  createdAt: Date;
  _count: { leads: number };
}): ServiceListItem {
  return {
    id: row.id,
    serviceName: row.serviceName,
    isActive: row.isActive,
    leadCount: row._count.leads,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listServicesPaginated(
  params: ServiceListParams,
): Promise<PaginatedResult<ServiceListItem>> {
  const where = buildWhere(params);
  const pagination = { page: params.page, pageSize: params.pageSize };

  const [total, rows] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      orderBy: { serviceName: "asc" },
      skip: paginationSkip(pagination),
      take: params.pageSize,
      include: { _count: { select: { leads: true } } },
    }),
  ]);

  return buildPaginatedResult(rows.map(mapRow), total, pagination);
}
