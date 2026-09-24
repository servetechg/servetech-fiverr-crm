import { addDays, startOfDay, subDays } from "date-fns";
import type { FollowUpStatus } from "@prisma/client";

import { FOLLOW_UP_CLOSED_STATUSES } from "@/lib/constants/follow-ups";
import { formatDateForInput } from "@/lib/utils/datetime";
import type { FollowUpListItem } from "@/types/follow-ups/follow-up-list-item";

export type FollowUpBucket = "overdue" | "today" | "upcoming" | "completed";

export const FOLLOW_UP_BUCKETS: FollowUpBucket[] = [
  "overdue",
  "today",
  "upcoming",
  "completed",
];

function todayDateString(now: Date = new Date()): string {
  return formatDateForInput(startOfDay(now));
}

export function getFollowUpBucket(item: FollowUpListItem, now: Date = new Date()): FollowUpBucket {
  if (FOLLOW_UP_CLOSED_STATUSES.includes(item.status)) {
    return "completed";
  }

  const todayStr = todayDateString(now);
  const scheduled = item.scheduledDate;

  if (scheduled < todayStr) {
    return "overdue";
  }
  if (scheduled === todayStr) {
    return "today";
  }
  return "upcoming";
}

export function canMoveFollowUpToBucket(
  item: FollowUpListItem,
  target: FollowUpBucket,
  now: Date = new Date(),
): boolean {
  return getFollowUpBucket(item, now) !== target;
}

function statusForDateColumn(item: FollowUpListItem): FollowUpStatus {
  if (FOLLOW_UP_CLOSED_STATUSES.includes(item.status)) {
    return "Pending";
  }
  return item.status;
}

export function getFollowUpUpdatesForBucket(
  item: FollowUpListItem,
  target: FollowUpBucket,
  now: Date = new Date(),
): { status: FollowUpStatus; scheduledDate: string } {
  const today = startOfDay(now);
  const todayStr = formatDateForInput(today);

  switch (target) {
    case "overdue":
      return {
        status: statusForDateColumn(item),
        scheduledDate: formatDateForInput(subDays(today, 1)),
      };
    case "today":
      return {
        status: statusForDateColumn(item),
        scheduledDate: todayStr,
      };
    case "upcoming": {
      const tomorrowStr = formatDateForInput(addDays(today, 1));
      const scheduledDate =
        item.scheduledDate >= tomorrowStr
          ? formatDateForInput(addDays(startOfDay(parseLocalDate(item.scheduledDate)), 1))
          : tomorrowStr;
      return {
        status: statusForDateColumn(item),
        scheduledDate,
      };
    }
    case "completed":
      return {
        status: FOLLOW_UP_CLOSED_STATUSES.includes(item.status) ? item.status : "Completed",
        scheduledDate: item.scheduledDate,
      };
  }
}

function parseLocalDate(dateStr: string): Date {
  const [yearRaw, monthRaw, dayRaw] = dateStr.split("-");
  const year = Number.parseInt(yearRaw ?? "", 10);
  const month = Number.parseInt(monthRaw ?? "", 10);
  const day = Number.parseInt(dayRaw ?? "", 10);
  return new Date(year, month - 1, day);
}
