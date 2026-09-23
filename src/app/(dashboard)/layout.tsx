import { redirect } from "next/navigation";

import { DashboardFrame } from "@/components/layout/dashboard-frame";
import { getSessionUser } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return <DashboardFrame user={user}>{children}</DashboardFrame>;
}
