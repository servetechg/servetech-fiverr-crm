import type { FollowUpStatus } from "@prisma/client";

export type FollowUpListItem = {
  id: number;
  leadId: number;
  leadCustomId: string;
  clientLabel: string;
  salespersonId: number;
  salespersonName: string;
  description: string;
  scheduledDate: string;
  lastContactDate: string | null;
  status: FollowUpStatus;
  notes: string | null;
};

export type FollowUpFormOptions = {
  leads: { id: number; leadCustomId: string; label: string; salespersonId: number }[];
  salespeople: { id: number; fullName: string }[];
};
