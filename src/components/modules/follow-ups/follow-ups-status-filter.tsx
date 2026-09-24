"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { FOLLOW_UP_STATUS_LABELS, FOLLOW_UP_STATUS_OPTIONS } from "@/lib/constants/follow-ups";
import { selectItemsFromLabels } from "@/lib/utils/select-items";

export function FollowUpsStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const value = searchParams.get("status") ?? "all";

  const selectItems = useMemo(
    () => ({
      all: "All statuses",
      ...selectItemsFromLabels(FOLLOW_UP_STATUS_LABELS),
    }),
    [],
  );

  const displayLabel =
    value === "all" ? "All statuses" : (FOLLOW_UP_STATUS_LABELS[value as keyof typeof FOLLOW_UP_STATUS_LABELS] ?? value);

  const onChange = (next: string | null): void => {
    if (!next) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("status");
    } else {
      params.set("status", next);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <Select items={selectItems} value={value} onValueChange={onChange}>
      <SelectTrigger className="glass-inset h-9 w-full rounded-full sm:w-[13rem]">
        <span className="flex min-w-0 items-center gap-1 truncate text-sm">
          <span className="shrink-0 text-muted-foreground">Status:</span>
          <span className="truncate font-medium text-foreground">{displayLabel}</span>
        </span>
      </SelectTrigger>
      <SelectContent className="rounded-2xl">
        <SelectItem value="all">All statuses</SelectItem>
        {FOLLOW_UP_STATUS_OPTIONS.map((status) => (
          <SelectItem key={status} value={status}>
            {FOLLOW_UP_STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
