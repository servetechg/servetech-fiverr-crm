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
    },
  });
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
    passwordHash?: string;
  } = {
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    role: input.role,
    monthlyTarget: input.monthlyTarget,
    isActive: input.isActive,
  };

  if (input.password) {
    data.passwordHash = await bcrypt.hash(input.password, 12);
  }

  await prisma.user.update({
    where: { id: input.id },
    data,
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
