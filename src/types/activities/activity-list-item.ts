import type { ActivityDirection, ActivityType } from "@prisma/client";

export type ActivityListItem = {
  id: number;
  leadId: number;
  leadCustomId: string;
  clientLabel: string;
  userId: number;
  repName: string;
  activityType: ActivityType;
  direction: ActivityDirection;
  responseTimeMinutes: number | null;
  messageCategory: string | null;
  actionTaken: string | null;
  upsellMentioned: boolean;
  notes: string;
  activityTime: string;
};

export type ActivityFormOptions = {
  leads: { id: number; leadCustomId: string; label: string }[];
  salespeople: { id: number; fullName: string }[];
};
