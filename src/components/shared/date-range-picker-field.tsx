"use client";

import { format } from "date-fns";
import { CalendarRange } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";
import { formatDateInput, parseDateInput } from "@/lib/utils/date-input";

type DateRangePickerFieldProps = {
  from: string;
  to: string;
  onApply: (from: string, to: string) => void;
  className?: string;
};

function toRange(from: string, to: string): DateRange | undefined {
  const fromDate = parseDateInput(from);
  const toDate = parseDateInput(to);
  if (!fromDate && !toDate) {
    return undefined;
  }
  return { from: fromDate, to: toDate };
}

export function DateRangePickerField({ from, to, onApply, className }: DateRangePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => toRange(from, to), [from, to]);

  const label =
    from && to
      ? `${format(parseDateInput(from) ?? new Date(), "MMM d")} – ${format(parseDateInput(to) ?? new Date(), "MMM d, yyyy")}`
      : "Pick dates";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "glass-field flex h-9 min-w-[10.5rem] items-center gap-2 rounded-full border border-[var(--field-border)] bg-[var(--field-bg)] px-3 text-sm shadow-none transition-colors",
          "hover:border-[rgb(20_20_20/0.16)] focus-visible:border-[rgb(195_245_60/0.55)] focus-visible:ring-[3px] focus-visible:ring-[rgb(195_245_60/0.22)]",
          className,
        )}
      >
        <CalendarRange className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate font-medium">{label}</span>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" sideOffset={8}>
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={selected}
          onSelect={(range) => {
            if (!range?.from) {
              return;
            }
            const nextFrom = formatDateInput(range.from);
            const nextTo = formatDateInput(range.to ?? range.from);
            onApply(nextFrom, nextTo);
            if (range.to) {
              setOpen(false);
            }
          }}
          defaultMonth={selected?.from}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
