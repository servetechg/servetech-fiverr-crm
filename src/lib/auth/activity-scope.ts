import type { Prisma } from "@prisma/client";

import { isAdmin } from "@/lib/auth/rbac";
import type { SessionUser } from "@/types/common/session-user";

export function activityScopeWhere(user: SessionUser): Prisma.ActivityWhereInput {
  if (isAdmin(user)) {
    return {};
  }
  return { lead: { salespersonId: user.id } };
}

export function followUpScopeWhere(user: SessionUser): Prisma.FollowUpWhereInput {
  if (isAdmin(user)) {
    return {};
  }
  return { salespersonId: user.id };
}
