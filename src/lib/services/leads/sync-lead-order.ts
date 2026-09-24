import type { OrderStatus } from "@prisma/client";
import { addDays, startOfDay } from "date-fns";

import { prisma } from "@/lib/db/prisma";
import { generateNextOrderNumber } from "@/lib/services/orders/generate-order-number";

export type LeadOrderSyncInput = {
  leadId: number;
  fiverrAccountId: number;
  salespersonId: number;
  serviceId: number;
  orderValue: number;
  orderStatus: OrderStatus;
  upsellEligible: boolean;
};

export async function syncLeadPrimaryOrder(input: LeadOrderSyncInput): Promise<void> {
  const deliveryDate = startOfDay(addDays(new Date(), 14));
  const orderDate = startOfDay(new Date());

  const existing = await prisma.order.findFirst({
    where: { leadId: input.leadId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
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
  } else {
    await prisma.order.create({
      data: {
        orderNumber: await generateNextOrderNumber(),
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
  }

  await prisma.lead.update({
    where: { id: input.leadId },
    data: {
      upsellEligible: input.upsellEligible,
      actualRevenue: input.orderValue,
    },
  });
}
