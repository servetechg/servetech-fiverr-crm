"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getNavItemsForUser } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/common/session-user";

type ModuleNavTabsProps = {
  user: SessionUser;
};

export function ModuleNavTabs({ user }: ModuleNavTabsProps) {
  const pathname = usePathname();
  const items = getNavItemsForUser(user);

  return (
    <nav
      className="w-full min-w-0"
      aria-label="Main modules"
    >
      <div className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-3.5 sm:text-sm",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-white/60 hover:text-foreground",
              )}
            >
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
