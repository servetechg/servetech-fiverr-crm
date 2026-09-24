import { leadScopeWhere } from "@/lib/auth/lead-scope";
import { prisma } from "@/lib/db/prisma";
import type { SessionUser } from "@/types/common/session-user";
import type { FollowUpFormOptions } from "@/types/follow-ups/follow-up-list-item";

export async function getFollowUpFormOptions(user: SessionUser): Promise<FollowUpFormOptions> {
  const [leads, salespeople] = await Promise.all([
    prisma.lead.findMany({
      where: leadScopeWhere(user),
      orderBy: [{ dateReceived: "desc" }, { id: "desc" }],
      take: 500,
      select: {
        id: true,
        leadCustomId: true,
        clientName: true,
        fiverrUsername: true,
        salespersonId: true,
      },
    }),
    prisma.user.findMany({
      where: { isActive: true, role: { in: ["Admin", "Salesperson"] } },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true },
    }),
  ]);

  return {
    leads: leads.map((lead) => ({
      id: lead.id,
      leadCustomId: lead.leadCustomId,
      label: `${lead.leadCustomId} · ${lead.clientName ?? lead.fiverrUsername}`,
      salespersonId: lead.salespersonId,
    })),
    salespeople,
  };
}
