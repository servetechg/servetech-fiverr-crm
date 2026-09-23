import { prisma } from "@/lib/db/prisma";
import type { ServiceListItem } from "@/types/services/service-list-item";

export async function listServices(): Promise<ServiceListItem[]> {
  const rows = await prisma.service.findMany({
    orderBy: { serviceName: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    serviceName: row.serviceName,
    category: row.category,
    defaultBasePrice: Number(row.defaultBasePrice ?? 0),
    createdAt: row.createdAt.toISOString(),
  }));
}
