import type { UserRole } from "@prisma/client";

export type SalesTeamListItem = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  monthlyTarget: number;
  isActive: boolean;
  assignedAccountNames: string[];
  assignedFiverrAccountIds: number[];
  notes: string | null;
  createdAt: string;
};

export type FiverrAccountOption = {
  id: number;
  accountName: string;
};
