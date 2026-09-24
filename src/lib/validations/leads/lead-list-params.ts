import { LeadPriority, LeadStatus } from "@prisma/client";
import { z } from "zod";

import { isDateRangePreset } from "@/lib/utils/date-range";

const optionalInt = z
  .string()
  .optional()
  .transform((value) => {
    if (!value || value === "all") {
      return undefined;
    }
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  });

export const leadListParamsSchema = z.object({
  q: z.string().trim().optional(),
  status: z
    .string()
    .optional()
    .transform((value) => {
      if (!value || value === "all") {
        return undefined;
      }
      return value as LeadStatus;
    })
    .pipe(z.enum(LeadStatus).optional()),
  priority: z
    .string()
    .optional()
    .transform((value) => {
      if (!value || value === "all") {
        return undefined;
      }
      return value as LeadPriority;
    })
    .pipe(z.enum(LeadPriority).optional()),
  fiverrAccountId: optionalInt,
  salespersonId: optionalInt,
  serviceId: optionalInt,
  range: z
    .string()
    .optional()
    .transform((value) => (value && isDateRangePreset(value) ? value : "last_30_days")),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((value) => Math.max(1, Number.parseInt(value ?? "1", 10) || 1)),
  pageSize: z
    .string()
    .optional()
    .transform((value) => Math.min(100, Math.max(1, Number.parseInt(value ?? "20", 10) || 20))),
});

export type LeadListParams = z.infer<typeof leadListParamsSchema>;

export function parseLeadListParams(
  searchParams: Record<string, string | string[] | undefined>,
): LeadListParams {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }
  return leadListParamsSchema.parse(normalized);
}
