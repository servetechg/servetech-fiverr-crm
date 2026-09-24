"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { USER_ROLE_LABELS } from "@/lib/constants/user-roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const ROLE_FILTER_LABELS: Record<string, string> = {
  all: "All",
  Admin: USER_ROLE_LABELS.Admin,
  Salesperson: USER_ROLE_LABELS.Salesperson,
};

export function AdminRoleFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const value = searchParams.get("role") ?? "all";
  const display = ROLE_FILTER_LABELS[value] ?? "All";

  const onChange = (next: string | null): void => {
    if (!next) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("role");
    } else {
      params.set("role", next);
    }
    params.set("page", "1");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="glass-inset h-9 w-full rounded-full sm:w-[10.5rem]">
        <span className="flex min-w-0 items-center gap-1 truncate text-sm">
          <span className="shrink-0 text-muted-foreground">Role:</span>
          <span className="truncate font-medium text-foreground">{display}</span>
        </span>
      </SelectTrigger>
      <SelectContent className="rounded-2xl">
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="Admin">Admin</SelectItem>
        <SelectItem value="Salesperson">Sales person</SelectItem>
      </SelectContent>
    </Select>
  );
}
