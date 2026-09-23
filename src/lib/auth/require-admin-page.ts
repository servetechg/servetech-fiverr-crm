import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";

export async function requireAdminPage(): Promise<void> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "Admin") {
    redirect("/");
  }
}
