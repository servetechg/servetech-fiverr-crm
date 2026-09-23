import type { UserRole } from "@prisma/client";

export type SessionUser = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
};
