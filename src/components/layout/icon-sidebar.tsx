"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import { getNavItemsForUser } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/common/session-user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type IconSidebarProps = {
  user: SessionUser;
};

export function IconSidebar({ user }: IconSidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItemsForUser(user);

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className="icon-rail sticky top-2 flex w-[4.75rem] shrink-0 flex-col items-center self-start sm:top-3"
      aria-label="Module shortcuts"
    >
      <Link
        href="/"
        className="mb-3 mt-1 flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5"
        title={siteConfig.name}
      >
        <Image
          src={siteConfig.logoIconSrc}
          alt={siteConfig.logoIconAlt}
          width={44}
          height={44}
          priority
          className="size-11 object-cover"
        />
      </Link>

      <nav className="flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-2 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          const Icon = item.icon;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger
                render={
                  <Link
                    href={item.href}
                    aria-label={item.title}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-white/55 hover:text-foreground",
                    )}
                  >
                    <Icon strokeWidth={1.75} className="size-[1.125rem]" />
                  </Link>
                }
              />
              <TooltipContent side="right" sideOffset={8}>
                {item.title}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="mt-2 flex w-full flex-col items-center gap-2 px-2 pb-3 pt-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <div
                tabIndex={0}
                className="flex size-10 cursor-default items-center justify-center rounded-full outline-none"
              >
                <Avatar className="size-9">
                  <AvatarFallback className="bg-foreground text-[10px] font-semibold text-background">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            }
          />
          <TooltipContent side="right">{user.fullName}</TooltipContent>
        </Tooltip>
        <form action={signOutAction}>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-full cursor-pointer text-muted-foreground hover:bg-white/55 hover:text-foreground"
                  aria-label="Sign out"
                >
                  <LogOut className="size-[1.125rem] cursor-pointer" strokeWidth={1.75} />
                </Button>
              }
            />
            <TooltipContent side="right" className="cursor-pointer">Sign out</TooltipContent>
          </Tooltip>
        </form>
      </div>
    </aside>
  );
}
