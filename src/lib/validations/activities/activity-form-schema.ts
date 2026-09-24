import { ActivityDirection, ActivityType } from "@prisma/client";
import { z } from "zod";

export const activityFormSchema = z.object({
  id: z.number().int().positive().optional(),
  leadId: z.number().int().positive("Select a lead"),
  userId: z.number().int().positive(),
  activityDate: z.string().trim().min(1, "Date is required"),
  activityTime: z.string().trim().min(1, "Time is required"),
  activityType: z.enum(ActivityType),
  direction: z.enum(ActivityDirection),
  messageCategory: z.string().trim().max(255).optional(),
  actionTaken: z.string().trim().max(500).optional(),
  responseTimeMinutes: z.number().int().min(0).optional(),
  upsellMentioned: z.boolean(),
  notes: z.string().trim().min(1, "Notes are required").max(5000),
});

export type ActivityFormInput = z.infer<typeof activityFormSchema>;

export const activityIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
