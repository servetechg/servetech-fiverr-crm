import { z } from "zod";

export const adminPaginationFields = {
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
};

export const activeStatusFilterSchema = z
  .enum(["all", "active", "inactive"])
  .optional()
  .transform((value) => value ?? "all");

export type ActiveStatusFilter = z.infer<typeof activeStatusFilterSchema>;
