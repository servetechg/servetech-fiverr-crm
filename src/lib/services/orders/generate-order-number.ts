import { prisma } from "@/lib/db/prisma";

export async function generateNextOrderNumber(): Promise<string> {
  const latest = await prisma.order.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  const match = latest?.orderNumber.match(/^ORD-(\d+)$/);
  const matchedDigits = match?.[1];
  const nextNumber = matchedDigits ? Number.parseInt(matchedDigits, 10) + 1 : 1;
  return `ORD-${String(nextNumber).padStart(5, "0")}`;
}
