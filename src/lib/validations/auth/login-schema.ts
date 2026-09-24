import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Enter a valid email address")
    .trim()
    .min(1, "Email is required")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
