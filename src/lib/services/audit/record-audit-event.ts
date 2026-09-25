import type { AuditCategory } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export type RecordAuditEventInput = {
  userId: number;
  category: AuditCategory;
  action: string;
  summary: string;
  details?: string;
  leadId?: number;
  entityLabel?: string;
};

export async function recordAuditEvent(input: RecordAuditEventInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      category: input.category,
      action: input.action.slice(0, 64),
      summary: input.summary.slice(0, 500),
      details: input.details?.trim() || null,
      leadId: input.leadId ?? null,
      entityLabel: input.entityLabel?.trim().slice(0, 255) || null,
    },
  });
}
