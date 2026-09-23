import { prisma } from "@/lib/db/prisma";

export async function generateNextLeadCustomId(): Promise<string> {
  const latest = await prisma.lead.findFirst({
    orderBy: { leadCustomId: "desc" },
    select: { leadCustomId: true },
  });

  const match = latest?.leadCustomId.match(/^FVR-(\d+)$/);
  const matchedDigits = match?.[1];
  const nextNumber = matchedDigits ? Number.parseInt(matchedDigits, 10) + 1 : 1;
  return `FVR-${String(nextNumber).padStart(5, "0")}`;
}
