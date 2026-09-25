"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { AuditCategory } from "@prisma/client";

import { auth, signIn, signOut } from "@/auth";
import { zodFieldErrors } from "@/lib/actions/zod-form-errors";
import { prisma } from "@/lib/db/prisma";
import { recordAuditEvent } from "@/lib/services/audit/record-audit-event";
import { loginSchema } from "@/lib/validations/auth/login-schema";
import { actionFailure, type ActionResult, actionSuccess } from "@/types/common/action-result";

export async function loginAction(
  _prevState: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid credentials.", zodFieldErrors(parsed.error));
  }

  const callbackUrl = formData.get("callbackUrl");
  const redirectTo =
    typeof callbackUrl === "string" && callbackUrl.startsWith("/") ? callbackUrl : "/";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return actionFailure("Invalid email or password.");
    }
    throw error;
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, fullName: true },
  });

  if (dbUser) {
    await recordAuditEvent({
      userId: dbUser.id,
      category: AuditCategory.Auth,
      action: "login",
      summary: "Signed in",
      details: `${dbUser.fullName} started a session.`,
    });
  }

  redirect(redirectTo);
  return actionSuccess(null);
}

export async function signOutAction(): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;

  if (typeof userId === "number") {
    await recordAuditEvent({
      userId,
      category: AuditCategory.Auth,
      action: "logout",
      summary: "Signed out",
      details: "User ended their session.",
    });
  }

  await signOut({ redirectTo: "/login" });
}
