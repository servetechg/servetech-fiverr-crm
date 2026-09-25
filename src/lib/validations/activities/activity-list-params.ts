import { AuditCategory } from "@prisma/client";
import { z } from "zod";

import { adminPaginationFields } from "@/lib/validations/admin/active-filter-params";
import { isDateRangePreset } from "@/lib/utils/date-range";

export const activityListParamsSchema = z.object({
  q: z.string().trim().optional(),
  range: z
    .string()
    .optional()
    .transform((value) => (value && isDateRangePreset(value) ? value : "all_time")),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  category: z
    .string()
    .optional()
    .transform((value) => {
      if (!value || value === "all") {
        return undefined;
      }
      return value as AuditCategory;
    })
    .pipe(z.enum(AuditCategory).optional()),
  salespersonId: z.coerce.number().int().positive().optional(),
  ...adminPaginationFields,
});

export type ActivityListParams = z.infer<typeof activityListParamsSchema>;

export function parseActivityListParams(
  input: Record<string, string | string[] | undefined>,
): ActivityListParams {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(input)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  return activityListParamsSchema.parse(flat);
}
