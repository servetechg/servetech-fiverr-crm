import { FollowUpStatus } from "@prisma/client";
import { z } from "zod";

import { FOLLOW_UP_BUCKETS, type FollowUpBucket } from "@/lib/utils/follow-up-bucket";

const dateOnlyString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date.");

export const followUpMoveSchema = z.object({
  id: z.coerce.number().int().positive(),
  targetBucket: z.enum(FOLLOW_UP_BUCKETS as [FollowUpBucket, ...FollowUpBucket[]]),
  status: z.enum(FollowUpStatus),
  scheduledDate: dateOnlyString,
});

export type FollowUpMoveInput = z.infer<typeof followUpMoveSchema>;
