import type { AuditCategory } from "@prisma/client";

export const AUDIT_CATEGORY_OPTIONS: AuditCategory[] = [
  "Auth",
  "Lead",
  "FollowUp",
  "Order",
  "Upsell",
  "FiverrAccount",
  "Team",
  "Service",
  "Data",
  "System",
];

export const AUDIT_CATEGORY_LABELS: Record<AuditCategory, string> = {
  Auth: "Authentication",
  Lead: "Leads",
  FollowUp: "Follow-ups",
  Order: "Orders",
  Upsell: "Upsells",
  FiverrAccount: "Fiverr accounts",
  Team: "Sales team",
  Service: "Services",
  Data: "Import / export",
  System: "System",
};
