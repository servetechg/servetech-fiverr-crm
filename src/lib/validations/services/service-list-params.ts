import { z } from "zod";

import {
  activeStatusFilterSchema,
  adminPaginationFields,
} from "@/lib/validations/admin/active-filter-params";

export const serviceListParamsSchema = z.object({
  q: z.string().trim().optional(),
  status: activeStatusFilterSchema,
  ...adminPaginationFields,
});

export type ServiceListParams = z.infer<typeof serviceListParamsSchema>;

export function parseServiceListParams(
  input: Record<string, string | string[] | undefined>,
): ServiceListParams {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(input)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  return serviceListParamsSchema.parse(flat);
}
