"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

export type FilterSelectProps = {
  label: string;
  value: string;
  displayValue: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  icon?: LucideIcon;
  isActive?: boolean;
  className?: string;
  contentClassName?: string;
};

export function FilterSelect({
  label,
  value,
  displayValue,
  onValueChange,
  children,
  icon: Icon,
  isActive = false,
  className,
  contentClassName,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => next && onValueChange(next)}>
      <SelectTrigger
        className={cn(
          "relative z-[1] h-9 w-full rounded-full sm:w-[12.5rem]",
          isActive &&
            "border-[rgb(195_245_60/0.45)] bg-[rgb(195_245_60/0.1)] ring-1 ring-[rgb(195_245_60/0.22)]",
          className,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-sm">
          {Icon ? (
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full bg-white/55 text-muted-foreground",
                isActive && "bg-[rgb(195_245_60/0.25)] text-foreground",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </span>
          ) : null}
          <span className="flex min-w-0 items-center gap-1 truncate">
            <span className="shrink-0 text-muted-foreground">{label}:</span>
            <span className="truncate font-medium text-foreground">{displayValue}</span>
          </span>
        </span>
      </SelectTrigger>
      <SelectContent
        align="start"
        side="bottom"
        sideOffset={10}
        alignItemWithTrigger={false}
        className={cn("min-w-[13rem]", contentClassName)}
      >
        {children}
      </SelectContent>
    </Select>
  );
}

export { SelectItem as FilterSelectItem };
