import { z } from "zod";

export const fiverrAccountFormSchema = z.object({
  id: z.number().int().positive().optional(),
  isActive: z.boolean(),
  accountName: z.string().trim().min(1, "Account name is required").max(255),
  accountOwner: z.string().trim().max(255).optional(),
  assignedTeam: z.string().trim().max(255).optional(),
  notes: z.string().trim().max(5000).optional(),
});

export type FiverrAccountFormInput = z.infer<typeof fiverrAccountFormSchema>;

export const fiverrAccountIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
