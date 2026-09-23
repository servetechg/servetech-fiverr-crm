import { prisma } from "@/lib/db/prisma";
import type { SalesTeamListItem } from "@/types/sales-team/user-list-item";

export async function listSalesTeam(): Promise<SalesTeamListItem[]> {
  const rows = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    role: row.role,
    monthlyTarget: Number(row.monthlyTarget),
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  }));
}
