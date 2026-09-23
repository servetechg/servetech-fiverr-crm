import { auth } from "@/auth";
import type { SessionUser } from "@/types/common/session-user";
import { actionFailure } from "@/types/common/action-result";

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const { id, email, fullName, role } = session.user;
  if (typeof id !== "number" || !email || !fullName || !role) {
    return null;
  }

  return { id, email, fullName, role };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdminUser(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (user.role !== "Admin") {
    throw new Error("Forbidden");
  }
  return user;
}

export function unauthorizedActionResult() {
  return actionFailure("You must be signed in to perform this action.");
}

export function forbiddenActionResult() {
  return actionFailure("You do not have permission to perform this action.");
}
