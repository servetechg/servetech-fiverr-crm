import { AuditCategory, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { recordAuditEvent } from "@/lib/services/audit/record-audit-event";
import type { FiverrAccountFormInput } from "@/lib/validations/fiverr-accounts/account-schema";
import type { SessionUser } from "@/types/common/session-user";

function assertAdmin(user: SessionUser): void {
  if (user.role !== "Admin") {
    throw new Error("Forbidden");
  }
}

function normalizeOptionalText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export async function createFiverrAccount(
  user: SessionUser,
  input: FiverrAccountFormInput,
): Promise<{ id: number }> {
  assertAdmin(user);
  const created = await prisma.fiverrAccount.create({
    data: {
      accountName: input.accountName,
      accountOwner: normalizeOptionalText(input.accountOwner),
      assignedTeam: normalizeOptionalText(input.assignedTeam),
      notes: normalizeOptionalText(input.notes),
      isActive: input.isActive,
    },
  });

  await recordAuditEvent({
    userId: user.id,
    category: AuditCategory.FiverrAccount,
    action: "create",
    summary: "Fiverr account created",
    details: `Account "${input.accountName}" added.`,
    entityLabel: input.accountName,
  });

  return { id: created.id };
}

export async function updateFiverrAccount(
  user: SessionUser,
  input: FiverrAccountFormInput & { id: number },
): Promise<void> {
  assertAdmin(user);
  await prisma.fiverrAccount.update({
    where: { id: input.id },
    data: {
      accountName: input.accountName,
      accountOwner: normalizeOptionalText(input.accountOwner),
      assignedTeam: normalizeOptionalText(input.assignedTeam),
      notes: normalizeOptionalText(input.notes),
      isActive: input.isActive,
    },
  });

  await recordAuditEvent({
    userId: user.id,
    category: AuditCategory.FiverrAccount,
    action: "update",
    summary: "Fiverr account updated",
    details: `Account "${input.accountName}" saved.`,
    entityLabel: input.accountName,
  });
}

export async function deleteFiverrAccount(user: SessionUser, id: number): Promise<void> {
  assertAdmin(user);
  const existing = await prisma.fiverrAccount.findUnique({
    where: { id },
    select: { accountName: true },
  });
  try {
    await prisma.fiverrAccount.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("This account is linked to leads or orders and cannot be deleted.");
    }
    throw error;
  }

  if (existing) {
    await recordAuditEvent({
      userId: user.id,
      category: AuditCategory.FiverrAccount,
      action: "delete",
      summary: "Fiverr account deleted",
      details: `Account "${existing.accountName}" removed.`,
      entityLabel: existing.accountName,
    });
  }
}
