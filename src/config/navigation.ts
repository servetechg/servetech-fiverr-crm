import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Store,
  TrendingUp,
  UserCircle2,
  Users,
  Wrench,
} from "lucide-react";

import type { SessionUser } from "@/types/common/session-user";
import { isAdmin } from "@/lib/auth/rbac";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  description?: string;
};

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "KPIs, funnel, and charts",
  },
  {
    title: "Leads",
    href: "/leads",
    icon: UserCircle2,
    description: "Fiverr pipeline end to end",
  },
  {
    title: "Activities",
    href: "/activities",
    icon: Activity,
    description: "System activity and audit log",
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    description: "Confirmed Fiverr orders",
  },
  {
    title: "Upsells",
    href: "/upsells",
    icon: TrendingUp,
    description: "Add-on offers on orders",
  },
  {
    title: "Follow-ups",
    href: "/follow-ups",
    icon: ClipboardList,
    description: "Scheduled outreach tasks",
  },
  {
    title: "Fiverr Accounts",
    href: "/fiverr-accounts",
    icon: Store,
    adminOnly: true,
  },
  {
    title: "Sales Team",
    href: "/sales-team",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Services",
    href: "/services",
    icon: Wrench,
    adminOnly: true,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    adminOnly: true,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    adminOnly: true,
  },
];

export function getNavItemsForUser(user: SessionUser): NavItem[] {
  return MAIN_NAV_ITEMS.filter((item) => isAdmin(user) || !item.adminOnly);
}

export function getNavItemByHref(href: string): NavItem | undefined {
  if (href === "/") {
    return MAIN_NAV_ITEMS.find((item) => item.href === "/");
  }
  return MAIN_NAV_ITEMS.find((item) => item.href !== "/" && href.startsWith(item.href));
}

export const MODULE_PLACEHOLDERS: Record<string, { title: string; description: string; icon: LucideIcon }> = {
  "/leads": {
    title: "Leads",
    description: "Every Fiverr message that entered the pipeline, end to end.",
    icon: UserCircle2,
  },
  "/activities": {
    title: "Activity log",
    description: "Automatic audit trail of CRM actions by user and time.",
    icon: Activity,
  },
  "/orders": {
    title: "Orders",
    description: "Every confirmed Fiverr order, base value separated from upsell revenue.",
    icon: ShoppingCart,
  },
  "/upsells": {
    title: "Upsells",
    description: "Additional services offered on top of the original Fiverr order.",
    icon: TrendingUp,
  },
  "/follow-ups": {
    title: "Follow-ups",
    description: "Pending and overdue outreach tasks for your team.",
    icon: ClipboardList,
  },
  "/fiverr-accounts": {
    title: "Fiverr Accounts",
    description: "Manage seller profiles monitored by the team.",
    icon: Store,
  },
  "/sales-team": {
    title: "Sales Team",
    description: "Users, roles, and monthly targets.",
    icon: Users,
  },
  "/services": {
    title: "Services",
    description: "Service catalog for leads and orders.",
    icon: Wrench,
  },
  "/reports": {
    title: "Reports",
    description: "Performance, revenue, and lost-lead analytics.",
    icon: BarChart3,
  },
  "/settings": {
    title: "Settings",
    description: "Application configuration and audit tools.",
    icon: Settings,
  },
  "/": {
    title: "Dashboard",
    description: "Company-wide metrics and sales funnel.",
    icon: LayoutDashboard,
  },
};
