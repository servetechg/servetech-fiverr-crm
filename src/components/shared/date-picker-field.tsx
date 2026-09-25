"use client";

import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";
import { formatDateDisplay, formatDateInput, parseDateInput } from "@/lib/utils/date-input";

type DatePickerFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
};

export function DatePickerField({
  id,
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  clearable = false,
  className,
  fromDate,
  toDate,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDateInput(value);
  const label = selected ? formatDateDisplay(value) : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative", className)}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          className={cn(
            "glass-field flex h-10 w-full min-w-0 items-center justify-start gap-2 rounded-xl border border-[var(--field-border)] bg-[var(--field-bg)] px-3 py-2 text-left text-sm shadow-[inset_0_1px_2px_rgb(20_20_20/0.04)] transition-all duration-200 ease-out outline-none",
            "hover:border-[rgb(20_20_20/0.16)] focus-visible:border-[rgb(195_245_60/0.55)] focus-visible:ring-[3px] focus-visible:ring-[rgb(195_245_60/0.22)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-muted-foreground",
            clearable && selected && "pr-9",
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{label}</span>
        </PopoverTrigger>
        {clearable && selected && !disabled ? (
          <button
            type="button"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Clear date"
            onClick={(event) => {
              event.stopPropagation();
              onChange("");
            }}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
      <PopoverContent className="p-0" align="start" sideOffset={8}>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange(formatDateInput(date));
            setOpen(false);
          }}
          defaultMonth={selected}
          disabled={[
            ...(fromDate ? [{ before: fromDate }] : []),
            ...(toDate ? [{ after: toDate }] : []),
          ]}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
