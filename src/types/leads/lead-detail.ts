import type { ActivityType, LeadPriority, LeadStatus, OrderStatus } from "@prisma/client";

import type { LostReasonValue } from "@/lib/constants/lost-reasons";
import type { LostChatProof } from "@/types/leads/lost-chat-proof";

export type LeadActivityItem = {
  id: number;
  notes: string;
  activityType: ActivityType;
  activityTime: string;
  userName: string;
};

export type LeadDetail = {
  id: number;
  leadCustomId: string;
  dateReceived: string;
  clientName: string | null;
  fiverrUsername: string;
  chatLink: string | null;
  fiverrAccountId: number;
  fiverrAccountName: string;
  salespersonId: number;
  salespersonName: string;
  serviceId: number;
  serviceName: string;
  status: LeadStatus;
  priority: LeadPriority;
  estProjectValue: number;
  revenue: number;
  followUpDate: string | null;
  clientRequirement: string | null;
  internalNotes: string | null;
  lostReason: string | null;
  lostChatProof: LostChatProof | null;
  upsellEligible: boolean;
  activities: LeadActivityItem[];
};

export type LeadFormRecord = {
  id: number;
  dateReceived: string;
  clientName: string | null;
  fiverrUsername: string;
  chatLink: string | null;
  fiverrAccountId: number;
  salespersonId: number;
  serviceId: number;
  status: LeadStatus;
  priority: LeadPriority;
  estProjectValue: number;
  followUpDate: string | null;
  clientRequirement: string | null;
  internalNotes: string | null;
  lostReason?: LostReasonValue;
  lostChatProof: LostChatProof | null;
  orderValue?: number;
  orderStatus?: OrderStatus;
  upsellEligible: boolean;
};
