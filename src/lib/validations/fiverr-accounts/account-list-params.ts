import { z } from "zod";

import {
  activeStatusFilterSchema,
  adminPaginationFields,
} from "@/lib/validations/admin/active-filter-params";

export const fiverrAccountListParamsSchema = z.object({
  q: z.string().trim().optional(),
  status: activeStatusFilterSchema,
  ...adminPaginationFields,
});

export type FiverrAccountListParams = z.infer<typeof fiverrAccountListParamsSchema>;

export function parseFiverrAccountListParams(
  input: Record<string, string | string[] | undefined>,
): FiverrAccountListParams {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(input)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  return fiverrAccountListParamsSchema.parse(flat);
}
