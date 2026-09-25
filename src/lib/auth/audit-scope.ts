import type { Prisma } from "@prisma/client";

import { isAdmin } from "@/lib/auth/rbac";
import type { SessionUser } from "@/types/common/session-user";

/** Salespeople see their own actions plus events on leads they own. Admins see everything. */
export function auditScopeWhere(user: SessionUser): Prisma.AuditLogWhereInput {
  if (isAdmin(user)) {
    return {};
  }
  return {
    OR: [{ userId: user.id }, { lead: { salespersonId: user.id } }],
  };
}
