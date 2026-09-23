import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { ServiceFormInput } from "@/lib/validations/services/service-schema";
import type { SessionUser } from "@/types/common/session-user";

function assertAdmin(user: SessionUser): void {
  if (user.role !== "Admin") {
    throw new Error("Forbidden");
  }
}

export async function createService(user: SessionUser, input: ServiceFormInput): Promise<{ id: number }> {
  assertAdmin(user);
  const created = await prisma.service.create({
    data: {
      serviceName: input.serviceName,
      category: input.category,
      defaultBasePrice: input.defaultBasePrice,
    },
  });
  return { id: created.id };
}

export async function updateService(user: SessionUser, input: ServiceFormInput & { id: number }): Promise<void> {
  assertAdmin(user);
  await prisma.service.update({
    where: { id: input.id },
    data: {
      serviceName: input.serviceName,
      category: input.category,
      defaultBasePrice: input.defaultBasePrice,
    },
  });
}

export async function deleteService(user: SessionUser, id: number): Promise<void> {
  assertAdmin(user);
  try {
    await prisma.service.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("This service is linked to leads or orders and cannot be deleted.");
    }
    throw error;
  }
}
