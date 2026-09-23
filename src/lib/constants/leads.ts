import type { LeadPriority, LeadStatus } from "@prisma/client";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NewMessage: "New Message",
  Replied: "Replied",
  RequirementDiscussed: "Requirement Discussed",
  QuoteSent: "Quote Sent",
  FollowUpRequired: "Follow-up Required",
  OrderReceived: "Order Received",
  Completed: "Completed",
  Lost: "Lost",
};

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  Hot: "Hot",
  Warm: "Warm",
  Cold: "Cold",
};

export const LEAD_STATUS_OPTIONS = Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({
  value: value as LeadStatus,
  label,
}));

export const LEAD_PRIORITY_OPTIONS = Object.entries(LEAD_PRIORITY_LABELS).map(([value, label]) => ({
  value: value as LeadPriority,
  label,
}));
