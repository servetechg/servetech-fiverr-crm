import type { LeadPriority, LeadStatus } from "@prisma/client";

import type { LostChatProof } from "@/types/leads/lost-chat-proof";

export type LeadListItem = {
  id: number;
  leadCustomId: string;
  dateReceived: string;
  clientName: string | null;
  fiverrUsername: string;
  fiverrAccountId: number;
  fiverrAccountName: string;
  salespersonId: number;
  salespersonName: string;
  salespersonEmail: string;
  serviceId: number;
  serviceName: string;
  status: LeadStatus;
  priority: LeadPriority;
  estProjectValue: number;
  revenue: number;
  lostChatProof: LostChatProof | null;
};
