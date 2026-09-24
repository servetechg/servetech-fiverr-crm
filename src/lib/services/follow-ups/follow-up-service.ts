import { prisma } from "@/lib/db/prisma";
import { canMutateLead } from "@/lib/auth/lead-scope";
import { isAdmin } from "@/lib/auth/rbac";
import type { FollowUpFormInput } from "@/lib/validations/follow-ups/follow-up-form-schema";
import {
  formatDateOnlyFromDb,
  parseDateOnlyForDb,
  parseOptionalDateOnly,
} from "@/lib/utils/datetime";
import type { FollowUpMoveInput } from "@/lib/validations/follow-ups/follow-up-move-schema";
import type { SessionUser } from "@/types/common/session-user";
import type { FollowUpListItem } from "@/types/follow-ups/follow-up-list-item";

async function assertFollowUpAccess(user: SessionUser, followUpId: number): Promise<void> {
  const row = await prisma.followUp.findUnique({
    where: { id: followUpId },
    select: { salespersonId: true, lead: { select: { salespersonId: true } } },
  });
  if (!row) {
    throw new Error("Follow-up not found.");
  }
  if (!isAdmin(user) && row.salespersonId !== user.id) {
    throw new Error("Forbidden");
  }
}

function mapFollowUpData(input: FollowUpFormInput) {
  return {
    leadId: input.leadId,
    salespersonId: input.salespersonId,
    description: input.description.trim(),
    scheduledTime: parseDateOnlyForDb(input.scheduledDate),
    lastContactAt: parseOptionalDateOnly(input.lastContactDate),
    status: input.status,
    notes: input.notes?.trim() || null,
  };
}

export async function createFollowUp(
  user: SessionUser,
  input: FollowUpFormInput,
): Promise<{ id: number }> {
  const lead = await prisma.lead.findUnique({
    where: { id: input.leadId },
    select: { salespersonId: true },
  });
  if (!lead) {
    throw new Error("Lead not found.");
  }
  if (!canMutateLead(user, lead.salespersonId)) {
    throw new Error("Forbidden");
  }
  if (!isAdmin(user) && input.salespersonId !== user.id) {
    throw new Error("You can only assign follow-ups to yourself.");
  }

  const created = await prisma.followUp.create({
    data: mapFollowUpData(input),
  });
  return { id: created.id };
}

export async function updateFollowUp(
  user: SessionUser,
  input: FollowUpFormInput & { id: number },
): Promise<void> {
  await assertFollowUpAccess(user, input.id);

  const lead = await prisma.lead.findUnique({
    where: { id: input.leadId },
    select: { salespersonId: true },
  });
  if (!lead) {
    throw new Error("Lead not found.");
  }
  if (!canMutateLead(user, lead.salespersonId)) {
    throw new Error("Forbidden");
  }
  if (!isAdmin(user) && input.salespersonId !== user.id) {
    throw new Error("You can only assign follow-ups to yourself.");
  }

  await prisma.followUp.update({
    where: { id: input.id },
    data: mapFollowUpData(input),
  });
}

export async function deleteFollowUp(user: SessionUser, id: number): Promise<void> {
  await assertFollowUpAccess(user, id);
  await prisma.followUp.delete({ where: { id } });
}

function toListItem(row: {
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

export async function moveFollowUpBoard(
  user: SessionUser,
  input: FollowUpMoveInput,
): Promise<void> {
  await assertFollowUpAccess(user, input.id);

  await prisma.followUp.update({
    where: { id: input.id },
    data: {
      status: input.status,
      scheduledTime: parseDateOnlyForDb(input.scheduledDate),
    },
  });
}
