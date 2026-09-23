"use client";

import type { ReactNode } from "react";

import { DashboardTopbarClient } from "@/components/layout/dashboard-topbar-client";
import { IconSidebar } from "@/components/layout/icon-sidebar";
import type { SessionUser } from "@/types/common/session-user";

type DashboardFrameProps = {
  user: SessionUser;
  children: ReactNode;
};

export function DashboardFrame({ user, children }: DashboardFrameProps) {
  return (
    <div className="mesh-canvas min-h-svh w-full">
      <div className="mx-auto flex min-h-svh w-full max-w-[1760px] flex-col p-2 sm:p-3 lg:p-4">
        <div className="flex min-h-0 flex-1 gap-2 sm:gap-3">
          <IconSidebar user={user} />
          <div className="journey-panel flex min-h-[calc(100svh-1rem)] min-w-0 flex-1 flex-col sm:min-h-[calc(100svh-1.5rem)] md:min-h-[calc(100svh-2rem)]">
            <DashboardTopbarClient user={user} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
