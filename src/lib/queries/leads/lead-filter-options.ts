import { prisma } from "@/lib/db/prisma";
import type { LeadFilterOptions } from "@/types/leads/lead-filter-options";

export async function getLeadFilterOptions(): Promise<LeadFilterOptions> {
  const [fiverrAccounts, services, salespeople] = await Promise.all([
    prisma.fiverrAccount.findMany({
      where: { isActive: true },
      orderBy: { accountName: "asc" },
      select: { id: true, accountName: true },
    }),
    prisma.service.findMany({
      orderBy: { serviceName: "asc" },
      select: { id: true, serviceName: true },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true },
    }),
  ]);

  return {
    fiverrAccounts: fiverrAccounts.map((row) => ({ id: row.id, label: row.accountName })),
    services: services.map((row) => ({ id: row.id, label: row.serviceName })),
    salespeople: salespeople.map((row) => ({ id: row.id, label: row.fullName })),
  };
}
