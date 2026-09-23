"use client";

import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import type { SessionUser } from "@/types/common/session-user";

type DashboardTopbarClientProps = {
  user: SessionUser;
};

export function DashboardTopbarClient({ user }: DashboardTopbarClientProps) {
  return <DashboardTopbar user={user} />;
}
