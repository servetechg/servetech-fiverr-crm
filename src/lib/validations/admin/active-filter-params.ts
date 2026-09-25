import { z } from "zod";

import { parseTablePageSize } from "@/lib/constants/table-pagination";

export const adminPaginationFields = {
  page: z.coerce.number().int().positive().default(1),
  pageSize: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) =>
      parseTablePageSize(value === undefined ? undefined : String(value)),
    ),
};

export const activeStatusFilterSchema = z
  .enum(["all", "active", "inactive"])
  .optional()
  .transform((value) => value ?? "all");

export type ActiveStatusFilter = z.infer<typeof activeStatusFilterSchema>;
