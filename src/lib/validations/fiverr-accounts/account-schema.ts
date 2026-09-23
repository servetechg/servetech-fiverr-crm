import { z } from "zod";

export const fiverrAccountFormSchema = z.object({
  id: z.number().int().positive().optional(),
  isActive: z.boolean(),
  accountName: z.string().trim().min(1, "Account name is required").max(255),
  profileUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => value === "" || z.url().safeParse(value).success, {
      message: "Enter a valid URL",
    }),
});

export type FiverrAccountFormInput = z.infer<typeof fiverrAccountFormSchema>;

export const fiverrAccountIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
