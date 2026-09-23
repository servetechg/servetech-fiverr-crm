import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { FiverrAccountFormInput } from "@/lib/validations/fiverr-accounts/account-schema";
import type { SessionUser } from "@/types/common/session-user";

function assertAdmin(user: SessionUser): void {
  if (user.role !== "Admin") {
    throw new Error("Forbidden");
  }
}

export async function createFiverrAccount(
  user: SessionUser,
  input: FiverrAccountFormInput,
): Promise<{ id: number }> {
  assertAdmin(user);
  const created = await prisma.fiverrAccount.create({
    data: {
      accountName: input.accountName,
      profileUrl: input.profileUrl && input.profileUrl.length > 0 ? input.profileUrl : null,
      isActive: input.isActive,
    },
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
      profileUrl: input.profileUrl && input.profileUrl.length > 0 ? input.profileUrl : null,
      isActive: input.isActive,
    },
  });
}

export async function deleteFiverrAccount(user: SessionUser, id: number): Promise<void> {
  assertAdmin(user);
  try {
    await prisma.fiverrAccount.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("This account is linked to leads or orders and cannot be deleted.");
    }
    throw error;
  }
}
