import { followUpScopeWhere } from "@/lib/auth/activity-scope";
import { formatDateOnlyFromDb } from "@/lib/utils/datetime";
import { prisma } from "@/lib/db/prisma";
import type { SessionUser } from "@/types/common/session-user";
import type { FollowUpListItem } from "@/types/follow-ups/follow-up-list-item";

function mapRow(row: {
  id: number;
  leadId: number;
  salespersonId: number;
  description: string;
  scheduledTime: Date;
  lastContactAt: Date | null;
  status: FollowUpListItem["status"];
  notes: string | null;
  lead: { leadCustomId: string; clientName: string | null; fiverrUsername: string };
  salesperson: { fullName: string };
}): FollowUpListItem {
  return {
    id: row.id,
    leadId: row.leadId,
    leadCustomId: row.lead.leadCustomId,
    clientLabel: row.lead.clientName ?? row.lead.fiverrUsername,
    salespersonId: row.salespersonId,
    salespersonName: row.salesperson.fullName,
    description: row.description,
    scheduledDate: formatDateOnlyFromDb(row.scheduledTime),
    lastContactDate: row.lastContactAt ? formatDateOnlyFromDb(row.lastContactAt) : null,
    status: row.status,
    notes: row.notes,
  };
}

export async function listFollowUps(user: SessionUser): Promise<FollowUpListItem[]> {
  const rows = await prisma.followUp.findMany({
    where: followUpScopeWhere(user),
    orderBy: [{ scheduledTime: "asc" }, { id: "asc" }],
    take: 500,
    include: {
      lead: { select: { leadCustomId: true, clientName: true, fiverrUsername: true } },
      salesperson: { select: { fullName: true } },
    },
  });

  return rows.map(mapRow);
}
