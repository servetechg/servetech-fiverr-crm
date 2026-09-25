import { AuditCategory, type OrderStatus } from "@prisma/client";
import { addDays, startOfDay } from "date-fns";

import { prisma } from "@/lib/db/prisma";
import { generateNextOrderNumber } from "@/lib/services/orders/generate-order-number";
import { recordAuditEvent } from "@/lib/services/audit/record-audit-event";

export type LeadOrderSyncInput = {
  leadId: number;
  fiverrAccountId: number;
  salespersonId: number;
  serviceId: number;
  orderValue: number;
  orderStatus: OrderStatus;
  upsellEligible: boolean;
  actorUserId: number;
};

export async function syncLeadPrimaryOrder(input: LeadOrderSyncInput): Promise<void> {
  const deliveryDate = startOfDay(addDays(new Date(), 14));
  const orderDate = startOfDay(new Date());

  const existing = await prisma.order.findFirst({
    where: { leadId: input.leadId },
    orderBy: { createdAt: "asc" },
    select: { id: true, orderNumber: true },
  });

  if (existing) {
    await prisma.order.update({
      where: { id: existing.id },
      data: {
        frontRevenue: input.orderValue,
        status: input.orderStatus,
        fiverrAccountId: input.fiverrAccountId,
        salespersonId: input.salespersonId,
        serviceId: input.serviceId,
      },
    });

    await recordAuditEvent({
      userId: input.actorUserId,
      category: AuditCategory.Order,
      action: "update",
      summary: "Order updated from lead",
      details: `Order ${existing.orderNumber} synced with lead order details.`,
      leadId: input.leadId,
      entityLabel: existing.orderNumber,
    });
  } else {
    const orderNumber = await generateNextOrderNumber();
    await prisma.order.create({
      data: {
        orderNumber,
        leadId: input.leadId,
        fiverrAccountId: input.fiverrAccountId,
        salespersonId: input.salespersonId,
        serviceId: input.serviceId,
        frontRevenue: input.orderValue,
        orderDate,
        deliveryDate,
        status: input.orderStatus,
      },
    });

    await recordAuditEvent({
      userId: input.actorUserId,
      category: AuditCategory.Order,
      action: "create",
      summary: "Order created from lead",
      details: `Order ${orderNumber} linked to lead.`,
      leadId: input.leadId,
      entityLabel: orderNumber,
    });
  }

  await prisma.lead.update({
    where: { id: input.leadId },
    data: {
      upsellEligible: input.upsellEligible,
      actualRevenue: input.orderValue,
    },
  });
}
