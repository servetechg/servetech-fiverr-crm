import { prisma } from "@/lib/db/prisma";
import type { FiverrAccountListItem } from "@/types/fiverr-accounts/account-list-item";

export async function listFiverrAccounts(): Promise<FiverrAccountListItem[]> {
  const rows = await prisma.fiverrAccount.findMany({
    orderBy: { accountName: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    accountName: row.accountName,
    profileUrl: row.profileUrl,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  }));
}
