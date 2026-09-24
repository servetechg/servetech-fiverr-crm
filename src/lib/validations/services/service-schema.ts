import { z } from "zod";

export const serviceFormSchema = z.object({
  id: z.number().int().positive().optional(),
  serviceName: z.string().trim().min(1, "Service name is required").max(255),
  isActive: z.boolean(),
});

export type ServiceFormInput = z.infer<typeof serviceFormSchema>;

export const serviceIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const serviceActiveSchema = z.object({
  id: z.coerce.number().int().positive(),
  isActive: z.boolean(),
});
