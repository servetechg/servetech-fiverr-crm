import type { UserRole } from "@prisma/client";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  Admin: "Admin",
  Salesperson: "Sales person",
};
