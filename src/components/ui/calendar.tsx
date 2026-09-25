"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButtonProps,
  type DayPickerProps,
} from "react-day-picker";

import { cn } from "@/lib/utils/cn";

const dayButtonClass =
  "rdp-day_button inline-flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-sm font-normal text-foreground shadow-none transition-colors outline-none hover:bg-[rgb(195_245_60/0.14)] hover:text-[#c3f53c] focus-visible:ring-2 focus-visible:ring-[#c3f53c]/35 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40";

function CalendarDayButton({ day, modifiers, className, ...props }: DayButtonProps) {
  const selectedSingle =
    modifiers.selected &&
    !modifiers.range_start &&
    !modifiers.range_end &&
    !modifiers.range_middle;

  return (
    <button
      type="button"
      data-day={day.date.toLocaleDateString()}
      className={cn(
        dayButtonClass,
        modifiers.today && !modifiers.selected && "font-semibold text-[#c3f53c]",
        selectedSingle &&
          "bg-[rgb(195_245_60/0.22)] font-semibold text-[#c3f53c] hover:bg-[rgb(195_245_60/0.32)] hover:text-[#c3f53c]",
        modifiers.range_middle &&
          "rounded-none bg-[rgb(195_245_60/0.16)] text-[#c3f53c] hover:bg-[rgb(195_245_60/0.22)]",
        modifiers.range_start &&
          "rounded-full bg-[#c3f53c] font-semibold text-[#141414] hover:bg-[#b8e635] hover:text-[#141414]",
        modifiers.range_end &&
          "rounded-full bg-[#c3f53c] font-semibold text-[#141414] hover:bg-[#b8e635] hover:text-[#141414]",
        className,
      )}
      {...props}
    />
  );
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rdp-calendar rdp-root p-3", className)}
      classNames={{
        root: cn("relative", defaults.root),
        months: cn("flex flex-col gap-3 sm:flex-row", defaults.months),
        month: cn("flex flex-col gap-3", defaults.month),
        month_caption: cn("flex h-9 items-center justify-center px-1", defaults.month_caption),
        caption_label: cn("text-sm font-semibold text-foreground", defaults.caption_label),
        nav: cn("absolute inset-x-0 top-0 flex items-center justify-between px-1", defaults.nav),
        button_previous: cn(
          "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[rgb(195_245_60/0.14)] hover:text-[#c3f53c]",
          defaults.button_previous,
        ),
        button_next: cn(
          "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[rgb(195_245_60/0.14)] hover:text-[#c3f53c]",
          defaults.button_next,
        ),
        month_grid: cn("w-full border-collapse", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn("w-9 text-[0.7rem] font-medium text-muted-foreground", defaults.weekday),
        week: cn("mt-1 flex w-full", defaults.week),
        day: cn("relative p-0 text-center", defaults.day),
        day_button: cn("size-9", defaults.day_button),
        selected: cn("font-semibold", defaults.selected),
        today: cn("text-[#c3f53c]", defaults.today),
        outside: cn("text-muted-foreground/45", defaults.outside),
        disabled: cn("text-muted-foreground/35", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className={cn("size-4", chevronClassName)} {...chevronProps} />;
        },
        DayButton: CalendarDayButton,
      }}
      {...props}
    />
  );
}
