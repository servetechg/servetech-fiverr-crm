import { ActivityType, LeadStatus, Prisma } from "@prisma/client";
import type { LeadPriority } from "@prisma/client";
import { startOfDay } from "date-fns";

import { canMutateLead } from "@/lib/auth/lead-scope";
import { LOST_REASON_LABELS } from "@/lib/constants/lost-reasons";
import { LEAD_STATUS_LABELS } from "@/lib/constants/leads";
import { prisma } from "@/lib/db/prisma";
import { generateNextLeadCustomId } from "@/lib/services/leads/generate-lead-custom-id";
import { syncLeadPrimaryOrder } from "@/lib/services/leads/sync-lead-order";
import type { LeadFormInput } from "@/lib/validations/leads/lead-form-schema";
import type { SessionUser } from "@/types/common/session-user";
import type { LostChatProof } from "@/types/leads/lost-chat-proof";

function parseOptionalDate(value: string | undefined): Date | null {
  if (!value || value.trim() === "") {
    return null;
  }
  return startOfDay(new Date(value));
}

function parseRequiredDate(value: string): Date {
  return startOfDay(new Date(value));
}

function lostReasonLabel(value: LeadFormInput["lostReason"]): string | null {
  if (!value) {
    return null;
  }
  return LOST_REASON_LABELS[value];
}

function lostProofForSave(
  status: LeadStatus,
  proof: LostChatProof | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (status !== LeadStatus.Lost || !proof) {
    return Prisma.DbNull;
  }
  return proof;
}

async function logActivity(
  leadId: number,
  userId: number,
  notes: string,
  activityType: ActivityType = ActivityType.CustomNote,
): Promise<void> {
  await prisma.activity.create({
    data: {
      leadId,
      userId,
      notes,
      activityType,
      direction: "Internal",
    },
  });
}

async function applyOrderReceivedSideEffects(
  leadId: number,
  input: LeadFormInput,
): Promise<void> {
  if (input.status !== LeadStatus.OrderReceived) {
    return;
  }
  if (input.orderValue === undefined || !input.orderStatus) {
    return;
  }

  await syncLeadPrimaryOrder({
    leadId,
    fiverrAccountId: input.fiverrAccountId,
    salespersonId: input.salespersonId,
    serviceId: input.serviceId,
    orderValue: input.orderValue,
    orderStatus: input.orderStatus,
    upsellEligible: input.upsellEligible ?? false,
  });
}

export async function createLeadFull(
  user: SessionUser,
  input: LeadFormInput,
): Promise<{ id: number }> {
  if (user.role !== "Admin" && input.salespersonId !== user.id) {
    throw new Error("You can only assign leads to yourself.");
  }

  const leadCustomId = await generateNextLeadCustomId();

  const created = await prisma.lead.create({
    data: {
      leadCustomId,
      dateReceived: parseRequiredDate(input.dateReceived),
      clientName: input.clientName?.trim() || null,
      fiverrUsername: input.fiverrUsername,
      chatLink: input.chatLink && input.chatLink.length > 0 ? input.chatLink : null,
      fiverrAccountId: input.fiverrAccountId,
      salespersonId: input.salespersonId,
      serviceId: input.serviceId,
      status: input.status,
      priority: input.priority,
      estProjectValue: input.estProjectValue,
      followUpDate: parseOptionalDate(input.followUpDate),
      clientRequirement: input.clientRequirement?.trim() || null,
      internalNotes: input.internalNotes?.trim() || null,
      lostReason: input.status === LeadStatus.Lost ? lostReasonLabel(input.lostReason) : null,
      lostChatProof: lostProofForSave(input.status, input.lostChatProof),
      upsellEligible: input.status === LeadStatus.OrderReceived ? (input.upsellEligible ?? false) : false,
    },
  });

  await applyOrderReceivedSideEffects(created.id, input);

  return { id: created.id };
}

export async function updateLead(user: SessionUser, input: LeadFormInput & { id: number }): Promise<void> {
  const existing = await prisma.lead.findUnique({
    where: { id: input.id },
    select: { salespersonId: true, status: true },
  });

  if (!existing) {
    throw new Error("Lead not found.");
  }

  if (!canMutateLead(user, existing.salespersonId)) {
    throw new Error("Forbidden");
  }

  if (user.role !== "Admin" && input.salespersonId !== user.id) {
    throw new Error("You can only assign leads to yourself.");
  }

  await prisma.lead.update({
    where: { id: input.id },
    data: {
      dateReceived: parseRequiredDate(input.dateReceived),
      clientName: input.clientName?.trim() || null,
      fiverrUsername: input.fiverrUsername,
      chatLink: input.chatLink && input.chatLink.length > 0 ? input.chatLink : null,
      fiverrAccountId: input.fiverrAccountId,
      salespersonId: input.salespersonId,
      serviceId: input.serviceId,
      status: input.status,
      priority: input.priority,
      estProjectValue: input.estProjectValue,
      followUpDate: parseOptionalDate(input.followUpDate),
      clientRequirement: input.clientRequirement?.trim() || null,
      internalNotes: input.internalNotes?.trim() || null,
      lostReason: input.status === LeadStatus.Lost ? lostReasonLabel(input.lostReason) : null,
      lostChatProof: lostProofForSave(input.status, input.lostChatProof),
      upsellEligible: input.status === LeadStatus.OrderReceived ? (input.upsellEligible ?? false) : false,
    },
  });

  await applyOrderReceivedSideEffects(input.id, input);

  if (existing.status !== input.status) {
    await logActivity(
      input.id,
      user.id,
      `Status changed from ${LEAD_STATUS_LABELS[existing.status]} to ${LEAD_STATUS_LABELS[input.status]}.`,
    );
  }
}

export async function deleteLead(user: SessionUser, id: number): Promise<void> {
  const existing = await prisma.lead.findUnique({
    where: { id },
    select: { salespersonId: true },
  });

  if (!existing) {
    throw new Error("Lead not found.");
  }

  if (!canMutateLead(user, existing.salespersonId)) {
    throw new Error("Forbidden");
  }

  try {
    await prisma.lead.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("This lead is linked to orders or records and cannot be deleted.");
    }
    throw error;
  }
}

export type LeadCsvImportRow = {
  leadCustomId: string;
  dateReceived: string;
  fiverrUsername: string;
  fiverrAccountName: string;
  salespersonEmail: string;
  serviceName: string;
  status: LeadStatus;
  priority: LeadPriority;
  estProjectValue: number;
};

export async function importLeadsFromRows(
  user: SessionUser,
  rows: LeadCsvImportRow[],
): Promise<{ imported: number }> {
  if (rows.length === 0) {
    return { imported: 0 };
  }

  const accounts = await prisma.fiverrAccount.findMany();
  const services = await prisma.service.findMany();
  const users = await prisma.user.findMany({ where: { isActive: true } });

  const accountByName = new Map(accounts.map((a) => [a.accountName.toLowerCase(), a.id]));
  const serviceByName = new Map(services.map((s) => [s.serviceName.toLowerCase(), s.id]));
  const userByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u.id]));

  let imported = 0;

  for (const row of rows) {
    const fiverrAccountId = accountByName.get(row.fiverrAccountName.toLowerCase());
    const serviceId = serviceByName.get(row.serviceName.toLowerCase());
    const salespersonId = userByEmail.get(row.salespersonEmail.toLowerCase());

    if (!fiverrAccountId || !serviceId || !salespersonId) {
      throw new Error(`Invalid reference data in row ${row.leadCustomId}.`);
    }

    if (user.role !== "Admin" && salespersonId !== user.id) {
      throw new Error(`You cannot import leads for other salespeople (row ${row.leadCustomId}).`);
    }

    const existingLead = await prisma.lead.findUnique({
      where: { leadCustomId: row.leadCustomId },
      select: { salespersonId: true },
    });

    if (existingLead && !canMutateLead(user, existingLead.salespersonId)) {
      throw new Error(`You cannot update lead ${row.leadCustomId}.`);
    }

    await prisma.lead.upsert({
      where: { leadCustomId: row.leadCustomId },
      create: {
        leadCustomId: row.leadCustomId,
        dateReceived: parseRequiredDate(row.dateReceived),
        fiverrUsername: row.fiverrUsername,
        fiverrAccountId,
        serviceId,
        salespersonId,
        status: row.status,
        priority: row.priority,
        estProjectValue: row.estProjectValue,
      },
      update: {
        dateReceived: parseRequiredDate(row.dateReceived),
        fiverrUsername: row.fiverrUsername,
        fiverrAccountId,
        serviceId,
        salespersonId,
        status: row.status,
        priority: row.priority,
        estProjectValue: row.estProjectValue,
      },
    });
    imported += 1;
  }

  return { imported };
}
