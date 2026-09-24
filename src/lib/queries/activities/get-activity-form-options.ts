import { leadScopeWhere } from "@/lib/auth/lead-scope";
import { prisma } from "@/lib/db/prisma";
import type { SessionUser } from "@/types/common/session-user";
import type { ActivityFormOptions } from "@/types/activities/activity-list-item";

export async function getActivityFormOptions(user: SessionUser): Promise<ActivityFormOptions> {
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
      },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true },
    }),
  ]);

  return {
    leads: leads.map((lead) => ({
      id: lead.id,
      leadCustomId: lead.leadCustomId,
      label: `${lead.leadCustomId} · ${lead.clientName ?? lead.fiverrUsername}`,
    })),
    salespeople,
  };
}
