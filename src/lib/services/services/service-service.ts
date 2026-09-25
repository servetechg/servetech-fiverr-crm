import { AuditCategory, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { recordAuditEvent } from "@/lib/services/audit/record-audit-event";
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
      isActive: input.isActive,
      category: "General",
      defaultBasePrice: 0,
    },
  });

  await recordAuditEvent({
    userId: user.id,
    category: AuditCategory.Service,
    action: "create",
    summary: "Service created",
    details: `Service "${input.serviceName}" added.`,
    entityLabel: input.serviceName,
  });

  return { id: created.id };
}

export async function updateService(user: SessionUser, input: ServiceFormInput & { id: number }): Promise<void> {
  assertAdmin(user);
  await prisma.service.update({
    where: { id: input.id },
    data: {
      serviceName: input.serviceName,
      isActive: input.isActive,
    },
  });

  await recordAuditEvent({
    userId: user.id,
    category: AuditCategory.Service,
    action: "update",
    summary: "Service updated",
    details: `Service "${input.serviceName}" saved.`,
    entityLabel: input.serviceName,
  });
}

export async function setServiceActive(user: SessionUser, id: number, isActive: boolean): Promise<void> {
  assertAdmin(user);
  const existing = await prisma.service.findUnique({
    where: { id },
    select: { serviceName: true },
  });
  await prisma.service.update({
    where: { id },
    data: { isActive },
  });

  if (existing) {
    await recordAuditEvent({
      userId: user.id,
      category: AuditCategory.Service,
      action: "status",
      summary: isActive ? "Service activated" : "Service deactivated",
      details: `Service "${existing.serviceName}".`,
      entityLabel: existing.serviceName,
    });
  }
}

export async function deleteService(user: SessionUser, id: number): Promise<void> {
  assertAdmin(user);
  const existing = await prisma.service.findUnique({
    where: { id },
    select: { serviceName: true },
  });
  try {
    await prisma.service.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("This service is linked to leads or orders and cannot be deleted.");
    }
    throw error;
  }

  if (existing) {
    await recordAuditEvent({
      userId: user.id,
      category: AuditCategory.Service,
      action: "delete",
      summary: "Service deleted",
      details: `Service "${existing.serviceName}" removed.`,
      entityLabel: existing.serviceName,
    });
  }
}
