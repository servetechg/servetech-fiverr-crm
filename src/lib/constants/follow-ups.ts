import type { FollowUpStatus } from "@prisma/client";

export const FOLLOW_UP_STATUS_OPTIONS: FollowUpStatus[] = [
  "Pending",
  "Contacted",
  "Interested",
  "Converted",
  "NoResponse",
  "Lost",
  "Completed",
];

export const FOLLOW_UP_STATUS_LABELS: Record<FollowUpStatus, string> = {
  Pending: "Pending",
  Contacted: "Contacted",
  Interested: "Interested",
  Converted: "Converted",
  NoResponse: "No Response",
  Lost: "Lost",
  Completed: "Completed",
};

/** Statuses that appear in the Completed kanban column */
export const FOLLOW_UP_CLOSED_STATUSES: FollowUpStatus[] = [
  "Completed",
  "Converted",
  "Lost",
  "NoResponse",
];
