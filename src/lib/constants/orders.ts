import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  New: "New",
  InProgress: "In Progress",
  QA: "QA",
  Active: "Active",
  Delivered: "Delivered",
  Completed: "Completed",
  Cancelled: "Cancelled",
  Refunded: "Refund",
};

export const ORDER_STATUS_OPTIONS = (Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((value) => ({
  value,
  label: ORDER_STATUS_LABELS[value],
}));
