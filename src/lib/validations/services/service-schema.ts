import { z } from "zod";

export const serviceFormSchema = z.object({
  id: z.number().int().positive().optional(),
  serviceName: z.string().trim().min(1, "Service name is required").max(255),
  category: z.string().trim().min(1, "Category is required").max(100),
  defaultBasePrice: z.number().min(0, "Price must be 0 or greater"),
});

export type ServiceFormInput = z.infer<typeof serviceFormSchema>;

export const serviceIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
