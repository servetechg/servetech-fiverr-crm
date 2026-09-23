import { LeadPriority, LeadStatus, OrderStatus } from "@prisma/client";
import { z } from "zod";

import { LOST_REASON_VALUES } from "@/lib/constants/lost-reasons";
import { lostChatProofSchema } from "@/types/leads/lost-chat-proof";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === "" || z.url().safeParse(value).success, {
    message: "Enter a valid URL",
  });

const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || !Number.isNaN(Date.parse(value)), {
    message: "Enter a valid date",
  });

export const leadFormSchema = z
  .object({
    id: z.number().int().positive().optional(),
    dateReceived: z.string().trim().min(1, "Date received is required"),
    clientName: z.string().trim().max(255).optional(),
    fiverrUsername: z.string().trim().min(2, "Username is required").max(255),
    chatLink: optionalUrl,
    fiverrAccountId: z.number().int().positive(),
    salespersonId: z.number().int().positive(),
    serviceId: z.number().int().positive(),
    status: z.nativeEnum(LeadStatus),
    priority: z.nativeEnum(LeadPriority),
    estProjectValue: z.number().min(0),
    followUpDate: optionalDate,
    clientRequirement: z.string().trim().max(5000).optional(),
    internalNotes: z.string().trim().max(5000).optional(),
    lostReason: z.enum(LOST_REASON_VALUES).optional(),
    lostChatProof: lostChatProofSchema.nullable().optional(),
    orderValue: z.number().min(0).optional(),
    orderStatus: z.nativeEnum(OrderStatus).optional(),
    upsellEligible: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === LeadStatus.Lost && !data.lostReason) {
      ctx.addIssue({
        code: "custom",
        message: "Select a lost reason",
        path: ["lostReason"],
      });
    }
    if (data.status === LeadStatus.OrderReceived) {
      if (data.orderValue === undefined || Number.isNaN(data.orderValue)) {
        ctx.addIssue({
          code: "custom",
          message: "Order value is required",
          path: ["orderValue"],
        });
      }
      if (!data.orderStatus) {
        ctx.addIssue({
          code: "custom",
          message: "Order status is required",
          path: ["orderStatus"],
        });
      }
    }
  });

export type LeadFormInput = z.infer<typeof leadFormSchema>;

export const leadIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
