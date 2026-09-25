import { AuditCategory } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { FOLLOW_UP_STATUS_LABELS } from "@/lib/constants/follow-ups";
import { recordAuditEvent } from "@/lib/services/audit/record-audit-event";
import { canMutateLead } from "@/lib/auth/lead-scope";
import { isAdmin } from "@/lib/auth/rbac";
import type { FollowUpFormInput } from "@/lib/validations/follow-ups/follow-up-form-schema";
import { parseDateOnlyForDb, parseOptionalDateOnly } from "@/lib/utils/datetime";
import type { FollowUpMoveInput } from "@/lib/validations/follow-ups/follow-up-move-schema";
import type { SessionUser } from "@/types/common/session-user";

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

  await recordAuditEvent({
    userId: user.id,
    category: AuditCategory.FollowUp,
    action: "create",
    summary: "Follow-up scheduled",
    details: input.description.trim(),
    leadId: input.leadId,
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

  await recordAuditEvent({
    userId: user.id,
    category: AuditCategory.FollowUp,
    action: "update",
    summary: "Follow-up updated",
    details: `${input.description.trim()} · Status: ${FOLLOW_UP_STATUS_LABELS[input.status]}.`,
    leadId: input.leadId,
  });
}

export async function deleteFollowUp(user: SessionUser, id: number): Promise<void> {
  const existing = await prisma.followUp.findUnique({
    where: { id },
    select: { leadId: true, description: true },
  });
  await assertFollowUpAccess(user, id);
  await prisma.followUp.delete({ where: { id } });

  if (existing) {
    await recordAuditEvent({
      userId: user.id,
      category: AuditCategory.FollowUp,
      action: "delete",
      summary: "Follow-up removed",
      details: existing.description,
      leadId: existing.leadId,
    });
  }
}

export async function moveFollowUpBoard(
  user: SessionUser,
  input: FollowUpMoveInput,
): Promise<void> {
  await assertFollowUpAccess(user, input.id);

  const existing = await prisma.followUp.findUnique({
    where: { id: input.id },
    select: { leadId: true, description: true },
  });

  await prisma.followUp.update({
    where: { id: input.id },
    data: {
      status: input.status,
      scheduledTime: parseDateOnlyForDb(input.scheduledDate),
    },
  });

  if (existing) {
    await recordAuditEvent({
      userId: user.id,
      category: AuditCategory.FollowUp,
      action: "move",
      summary: "Follow-up moved on board",
      details: `${existing.description} · ${FOLLOW_UP_STATUS_LABELS[input.status]} · ${input.scheduledDate}.`,
      leadId: existing.leadId,
    });
  }
}
