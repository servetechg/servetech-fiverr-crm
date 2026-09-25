import { prisma } from "@/lib/db/prisma";
import type { SessionUser } from "@/types/common/session-user";
import type { ActivityFilterOptions } from "@/types/activities/activity-list-item";

export async function getActivityFilterOptions(user: SessionUser): Promise<ActivityFilterOptions> {
  void user;
  const salespeople = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true },
  });

  return { salespeople };
}
