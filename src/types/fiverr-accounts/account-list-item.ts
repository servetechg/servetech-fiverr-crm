export type FiverrAccountListItem = {
  id: number;
  accountName: string;
  accountOwner: string | null;
  assignedTeam: string | null;
  notes: string | null;
  isActive: boolean;
  leadCount: number;
  createdAt: string;
};
