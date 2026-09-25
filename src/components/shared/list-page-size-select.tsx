"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

type ListPageSizeSelectProps = {
  value: number;
  options: readonly number[];
  className?: string;
};

export function ListPageSizeSelect({ value, options, className }: ListPageSizeSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const onChange = (next: string | null): void => {
    if (!next) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", next);
    params.set("page", "1");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">Show</span>
      <Select value={String(value)} onValueChange={onChange}>
        <SelectTrigger className="relative z-[1] h-9 w-[5.5rem] shrink-0 rounded-full border-[var(--field-border)] text-sm shadow-none">
          <span className="flex-1 text-center font-medium tabular-nums">{value}</span>
        </SelectTrigger>
        <SelectContent
          align="start"
          side="bottom"
          sideOffset={8}
          alignItemWithTrigger={false}
          className="scroll-surface w-[5.5rem] !min-w-[5.5rem] max-w-[5.5rem] rounded-xl p-1"
        >
          {options.map((size) => (
            <SelectItem
              key={size}
              value={String(size)}
              className="justify-center rounded-lg py-2 pr-8 pl-2 text-center tabular-nums"
            >
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-sm text-muted-foreground">per page</span>
    </div>
  );
}
