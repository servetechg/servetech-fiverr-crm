import type { Prisma } from "@prisma/client";

import type { SessionUser } from "@/types/common/session-user";
import { isAdmin } from "@/lib/auth/rbac";

/** List/read scope: all authenticated users see the full pipeline. */
export function leadScopeWhere(_user: SessionUser): Prisma.LeadWhereInput {
  return {};
}

export function canMutateLead(user: SessionUser, leadSalespersonId: number): boolean {
  if (isAdmin(user)) {
    return true;
  }
  return user.id === leadSalespersonId;
}

export function canDeleteLead(user: SessionUser): boolean {
  return isAdmin(user);
}
