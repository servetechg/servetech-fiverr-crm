import type { Prisma } from "@prisma/client";

import type { SessionUser } from "@/types/common/session-user";
import { isAdmin } from "@/lib/auth/rbac";

export function leadScopeWhere(user: SessionUser): Prisma.LeadWhereInput {
  if (isAdmin(user)) {
    return {};
  }
  return { salespersonId: user.id };
}

export function canMutateLead(user: SessionUser, leadSalespersonId: number): boolean {
  if (isAdmin(user)) {
    return true;
  }
  return user.id === leadSalespersonId;
}
