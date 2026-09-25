import { Suspense } from "react";

import { TopbarDateRangeSlot } from "@/components/layout/topbar-date-range-slot";
import { ModuleNavTabs } from "@/components/layout/module-nav-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { SessionUser } from "@/types/common/session-user";

type DashboardTopbarProps = {
  user: SessionUser;
};

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  return (
    <header className="glass-header shrink-0 border-b border-border/60 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ModuleNavTabs user={user} />
        <Suspense
          fallback={
            <Skeleton className="h-9 w-full rounded-full lg:ml-auto lg:w-[11.25rem]" />
          }
        >
          <TopbarDateRangeSlot />
        </Suspense>
      </div>
    </header>
  );
}
