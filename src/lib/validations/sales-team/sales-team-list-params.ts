import { z } from "zod";

import {
  activeStatusFilterSchema,
  adminPaginationFields,
} from "@/lib/validations/admin/active-filter-params";

export const salesTeamListParamsSchema = z.object({
  q: z.string().trim().optional(),
  role: z
    .enum(["all", "Admin", "Salesperson"])
    .optional()
    .transform((value) => value ?? "all"),
  status: activeStatusFilterSchema,
  ...adminPaginationFields,
});

export type SalesTeamListParams = z.infer<typeof salesTeamListParamsSchema>;

export function parseSalesTeamListParams(
  input: Record<string, string | string[] | undefined>,
): SalesTeamListParams {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(input)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  return salesTeamListParamsSchema.parse(flat);
}
