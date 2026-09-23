import type { UserRole } from "@prisma/client";

export type SalesTeamListItem = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  monthlyTarget: number;
  isActive: boolean;
  createdAt: string;
};
