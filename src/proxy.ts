import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessPath } from "@/lib/auth/rbac";
import type { SessionUser } from "@/types/common/session-user";

const AUTH_PATH = "/login";

function toSessionUser(session: {
  user?: {
    id?: number;
    email?: string | null;
    fullName?: string;
    role?: SessionUser["role"];
  };
}): SessionUser | null {
  const user = session.user;
  if (!user?.email || typeof user.id !== "number" || !user.fullName || !user.role) {
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;
  const isLoggedIn = Boolean(session?.user);

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (pathname === AUTH_PATH) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL(AUTH_PATH, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = session ? toSessionUser(session) : null;
  if (user && !canAccessPath(user, pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
