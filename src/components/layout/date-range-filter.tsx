"use client";

import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DateRangePickerField } from "@/components/shared/date-range-picker-field";
import { FilterSelect, FilterSelectItem } from "@/components/shared/filter-select";
import {
  DATE_RANGE_PRESETS,
  type DateRangePreset,
  isDateRangePreset,
  resolveDateRange,
} from "@/lib/utils/date-range";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESET_LABELS: Record<DateRangePreset, string> = {
  all_time: "All Time",
  today: "Today",
  yesterday: "Yesterday",
  last_7_days: "Last 7 Days",
  last_30_days: "Last 30 Days",
  this_month: "This Month",
  last_month: "Last Month",
  custom: "Custom Range",
};

type DateRangeFilterProps = {
  labeled?: boolean;
  icon?: LucideIcon;
};

export function DateRangeFilter({ labeled = false, icon }: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get("range");
  const value: DateRangePreset =
    current && isDateRangePreset(current) ? current : "last_30_days";
  const fromParam = searchParams.get("from") ?? "";
  const toParam = searchParams.get("to") ?? "";
  const displayValue =
    value === "custom"
      ? resolveDateRange("custom", fromParam, toParam).label
      : PRESET_LABELS[value];

  const onChange = (next: DateRangePreset) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", next);
    params.set("page", "1");
    if (next !== "custom") {
      params.delete("from");
      params.delete("to");
    } else if (!params.get("from") || !params.get("to")) {
      const fallback = resolveDateRange("last_30_days");
      if (fallback.from && fallback.to) {
        params.set("from", format(fallback.from, "yyyy-MM-dd"));
        params.set("to", format(fallback.to, "yyyy-MM-dd"));
      }
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onCustomRangeApply = (from: string, to: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", "custom");
    params.set("from", from);
    params.set("to", to);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const customRangePicker =
    value === "custom" ? (
      <DateRangePickerField from={fromParam} to={toParam} onApply={onCustomRangeApply} />
    ) : null;

  if (labeled) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Date"
          icon={icon}
          value={value}
          displayValue={displayValue}
          isActive={value !== "last_30_days"}
          onValueChange={(next) => onChange(next as DateRangePreset)}
          className="w-[min(100%,11rem)] sm:w-[12rem]"
        >
          {DATE_RANGE_PRESETS.map((preset) => (
            <FilterSelectItem key={preset} value={preset}>
              {PRESET_LABELS[preset]}
            </FilterSelectItem>
          ))}
        </FilterSelect>
        {customRangePicker}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        items={PRESET_LABELS}
        value={value}
        onValueChange={(v) => v && onChange(v as DateRangePreset)}
      >
        <SelectTrigger className="glass-inset h-9 w-[min(100%,10rem)] rounded-full border-[var(--field-border)] text-sm font-medium shadow-none sm:w-[12.5rem]">
          <SelectValue placeholder="Date range">{displayValue}</SelectValue>
        </SelectTrigger>
        <SelectContent align="start" side="bottom" alignItemWithTrigger={false}>
          {DATE_RANGE_PRESETS.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {PRESET_LABELS[preset]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {customRangePicker}
    </div>
  );
}
