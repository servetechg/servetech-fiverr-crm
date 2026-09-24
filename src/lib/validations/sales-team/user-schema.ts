import { z } from "zod";

const userRoleSchema = z.enum(["Admin", "Salesperson"]);

export const salesTeamFormSchema = z
  .object({
    id: z.number().int().positive().optional(),
    fullName: z.string().trim().min(1, "Full name is required").max(255),
    email: z.email("Enter a valid email").trim().max(255),
    role: userRoleSchema,
    monthlyTarget: z.number().min(0, "Target must be 0 or greater"),
    isActive: z.boolean(),
    fiverrAccountIds: z.array(z.number().int().positive()),
    notes: z.string().trim().max(5000).optional(),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const isCreate = data.id === undefined;
    if (isCreate && !data.password) {
      ctx.addIssue({
        code: "custom",
        message: "Password is required when creating a user",
        path: ["password"],
      });
    }
    if (data.password && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type SalesTeamFormInput = z.infer<typeof salesTeamFormSchema>;

export const salesTeamIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
