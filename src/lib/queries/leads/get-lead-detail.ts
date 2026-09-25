import { format } from "date-fns";
import { notFound } from "next/navigation";

import { canMutateLead } from "@/lib/auth/lead-scope";
import { prisma } from "@/lib/db/prisma";
import { lostReasonDisplay, parseLostReasonFromDb } from "@/lib/utils/lost-reason-parse";
import type { LeadDetail, LeadFormRecord } from "@/types/leads/lead-detail";
import type { SessionUser } from "@/types/common/session-user";
import { parseLostChatProof } from "@/types/leads/lost-chat-proof";

function formatDate(value: Date): string {
  return format(value, "yyyy-MM-dd");
}

export async function getLeadDetail(user: SessionUser, id: number): Promise<LeadDetail> {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      fiverrAccount: { select: { accountName: true } },
      salesperson: { select: { fullName: true } },
      service: { select: { serviceName: true } },
      orders: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { frontRevenue: true },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { fullName: true } } },
      },
    },
  });

  if (!lead) {
    notFound();
  }

  const orderRevenue = lead.orders[0] ? Number(lead.orders[0].frontRevenue) : Number(lead.actualRevenue);

  return {
    id: lead.id,
    leadCustomId: lead.leadCustomId,
    dateReceived: formatDate(lead.dateReceived),
    clientName: lead.clientName,
    fiverrUsername: lead.fiverrUsername,
    chatLink: lead.chatLink,
    fiverrAccountId: lead.fiverrAccountId,
    fiverrAccountName: lead.fiverrAccount.accountName,
    salespersonId: lead.salespersonId,
    salespersonName: lead.salesperson.fullName,
    serviceId: lead.serviceId,
    serviceName: lead.service.serviceName,
    status: lead.status,
    priority: lead.priority,
    estProjectValue: Number(lead.estProjectValue),
    revenue: orderRevenue,
    followUpDate: lead.followUpDate ? formatDate(lead.followUpDate) : null,
    clientRequirement: lead.clientRequirement,
    internalNotes: lead.internalNotes,
    lostReason: lostReasonDisplay(lead.lostReason),
    lostChatProof: parseLostChatProof(lead.lostChatProof),
    upsellEligible: lead.upsellEligible,
    canEdit: canMutateLead(user, lead.salespersonId),
    activities: lead.auditLogs.map((entry) => ({
      id: entry.id,
      summary: entry.summary,
      details: entry.details,
      category: entry.category,
      activityTime: entry.createdAt.toISOString(),
      userName: entry.user.fullName,
    })),
  };
}

export async function getLeadFormRecord(user: SessionUser, id: number): Promise<LeadFormRecord | null> {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  if (!lead) {
    return null;
  }

  if (!canMutateLead(user, lead.salespersonId)) {
    return null;
  }

  const primaryOrder = lead.orders[0];

  return {
    id: lead.id,
    dateReceived: formatDate(lead.dateReceived),
    clientName: lead.clientName,
    fiverrUsername: lead.fiverrUsername,
    chatLink: lead.chatLink,
    fiverrAccountId: lead.fiverrAccountId,
    salespersonId: lead.salespersonId,
    serviceId: lead.serviceId,
    status: lead.status,
    priority: lead.priority,
    estProjectValue: Number(lead.estProjectValue),
    followUpDate: lead.followUpDate ? formatDate(lead.followUpDate) : null,
    clientRequirement: lead.clientRequirement,
    internalNotes: lead.internalNotes,
    lostReason: parseLostReasonFromDb(lead.lostReason),
    lostChatProof: parseLostChatProof(lead.lostChatProof),
    orderValue: primaryOrder ? Number(primaryOrder.frontRevenue) : undefined,
    orderStatus: primaryOrder?.status,
    upsellEligible: lead.upsellEligible,
  };
}
