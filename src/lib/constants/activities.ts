import type { ActivityDirection, ActivityType } from "@prisma/client";

export const ACTIVITY_TYPE_OPTIONS: ActivityType[] = [
  "ClientMessage",
  "SalesReply",
  "Requirement",
  "PriceDiscussion",
  "QuoteSent",
  "RevisionDiscussion",
  "UpsellOffered",
  "FollowUp",
  "OrderReceived",
  "OrderCompleted",
  "OrderCancelled",
  "Lost",
  "CustomNote",
];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  ClientMessage: "Client Message",
  SalesReply: "Sales Reply",
  Requirement: "Requirement",
  PriceDiscussion: "Price Discussion",
  QuoteSent: "Quote Sent",
  RevisionDiscussion: "Revision Discussion",
  UpsellOffered: "Upsell Offered",
  FollowUp: "Follow-up",
  OrderReceived: "Order Received",
  OrderCompleted: "Order Completed",
  OrderCancelled: "Order Cancelled",
  Lost: "Lost",
  CustomNote: "Custom Note",
};

export const ACTIVITY_DIRECTION_OPTIONS: ActivityDirection[] = [
  "Incoming",
  "Outgoing",
  "Internal",
];

export const ACTIVITY_DIRECTION_LABELS: Record<ActivityDirection, string> = {
  Incoming: "Incoming",
  Outgoing: "Outgoing",
  Internal: "Internal",
};
