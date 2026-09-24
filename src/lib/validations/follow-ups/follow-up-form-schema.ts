import { FollowUpStatus } from "@prisma/client";
import { z } from "zod";

export const followUpFormSchema = z.object({
  id: z.number().int().positive().optional(),
  leadId: z.number().int().positive("Select a lead"),
  salespersonId: z.number().int().positive(),
  scheduledDate: z.string().trim().min(1, "Follow-up date is required"),
  description: z.string().trim().min(1, "Follow-up reason is required").max(500),
  status: z.enum(FollowUpStatus),
  lastContactDate: z.string().trim().optional(),
  notes: z.string().trim().max(5000).optional(),
});

export type FollowUpFormInput = z.infer<typeof followUpFormSchema>;

export const followUpIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
