import type { UserRole } from "@prisma/client";

import type { SessionUser } from "@/types/common/session-user";

export const ADMIN_ONLY_PATH_PREFIXES = [
  "/fiverr-accounts",
  "/sales-team",
  "/services",
  "/reports",
  "/settings",
] as const;

export function isAdmin(user: SessionUser): boolean {
  return user.role === "Admin";
}

export function canAccessPath(user: SessionUser, pathname: string): boolean {
  if (!isAdmin(user)) {
    return !ADMIN_ONLY_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  }
  return true;
}

export function roleLabel(role: UserRole): string {
  return role;
}
