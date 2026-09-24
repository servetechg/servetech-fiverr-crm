import { prisma } from "@/lib/db/prisma";
import { canMutateLead } from "@/lib/auth/lead-scope";
import type { SessionUser } from "@/types/common/session-user";

export async function assertCanAccessLead(user: SessionUser, leadId: number): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { salespersonId: true },
  });
  if (!lead) {
    throw new Error("Lead not found.");
  }
  if (!canMutateLead(user, lead.salespersonId)) {
    throw new Error("Forbidden");
  }
}

export async function assertCanAccessActivity(user: SessionUser, activityId: number): Promise<number> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { leadId: true, lead: { select: { salespersonId: true } } },
  });
  if (!activity) {
    throw new Error("Activity not found.");
  }
  if (!canMutateLead(user, activity.lead.salespersonId)) {
    throw new Error("Forbidden");
  }
  return activity.leadId;
}
