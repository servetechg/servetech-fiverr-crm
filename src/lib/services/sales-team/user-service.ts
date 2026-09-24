import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";
import type { SalesTeamFormInput } from "@/lib/validations/sales-team/user-schema";
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

async function syncAssignedAccounts(userId: number, fiverrAccountIds: number[]): Promise<void> {
  await prisma.userFiverrAccount.deleteMany({ where: { userId } });
  if (fiverrAccountIds.length === 0) {
    return;
  }
  await prisma.userFiverrAccount.createMany({
    data: fiverrAccountIds.map((fiverrAccountId) => ({ userId, fiverrAccountId })),
    skipDuplicates: true,
  });
}

export async function createTeamMember(
  user: SessionUser,
  input: SalesTeamFormInput,
): Promise<{ id: number }> {
  assertAdmin(user);
  if (!input.password) {
    throw new Error("Password is required");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const created = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
      monthlyTarget: input.monthlyTarget,
      isActive: input.isActive,
      notes: normalizeOptionalText(input.notes),
    },
  });

  await syncAssignedAccounts(created.id, input.fiverrAccountIds);
  return { id: created.id };
}

export async function updateTeamMember(
  user: SessionUser,
  input: SalesTeamFormInput & { id: number },
): Promise<void> {
  assertAdmin(user);

  const data: {
    fullName: string;
    email: string;
    role: SalesTeamFormInput["role"];
    monthlyTarget: number;
    isActive: boolean;
    notes: string | null;
    passwordHash?: string;
  } = {
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    role: input.role,
    monthlyTarget: input.monthlyTarget,
    isActive: input.isActive,
    notes: normalizeOptionalText(input.notes),
  };

  if (input.password) {
    data.passwordHash = await bcrypt.hash(input.password, 12);
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: input.id },
      data,
    });
    await tx.userFiverrAccount.deleteMany({ where: { userId: input.id } });
    if (input.fiverrAccountIds.length > 0) {
      await tx.userFiverrAccount.createMany({
        data: input.fiverrAccountIds.map((fiverrAccountId) => ({
          userId: input.id,
          fiverrAccountId,
        })),
        skipDuplicates: true,
      });
    }
  });
}

export async function deleteTeamMember(user: SessionUser, id: number): Promise<void> {
  assertAdmin(user);
  if (user.id === id) {
    throw new Error("You cannot delete your own account.");
  }
  try {
    await prisma.user.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("This user is linked to leads or records and cannot be deleted.");
    }
    throw error;
  }
}
