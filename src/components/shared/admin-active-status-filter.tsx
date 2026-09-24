"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  active: "Active",
  inactive: "Inactive",
};

type AdminActiveStatusFilterProps = {
  paramKey?: string;
};

export function AdminActiveStatusFilter({ paramKey = "status" }: AdminActiveStatusFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const value = searchParams.get(paramKey) ?? "all";
  const display = STATUS_LABELS[value] ?? "All";

  const onChange = (next: string | null): void => {
    if (!next) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete(paramKey);
    } else {
      params.set(paramKey, next);
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
          <span className="shrink-0 text-muted-foreground">Status:</span>
          <span className="truncate font-medium text-foreground">{display}</span>
        </span>
      </SelectTrigger>
      <SelectContent className="rounded-2xl">
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
      </SelectContent>
    </Select>
  );
}
