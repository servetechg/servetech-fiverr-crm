import type { AuditCategory, UserRole } from "@prisma/client";

export type ActivityListItem = {
  id: number;
  userId: number;
  repName: string;
  userRole: UserRole;
  category: AuditCategory;
  action: string;
  summary: string;
  details: string | null;
  leadId: number | null;
  leadCustomId: string | null;
  clientLabel: string | null;
  entityLabel: string | null;
  occurredAt: string;
};

export type ActivityFilterOptions = {
  salespeople: { id: number; fullName: string }[];
};
