"use client";

import type { LucideIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterSelect, FilterSelectItem } from "@/components/shared/filter-select";
import {
  DATE_RANGE_PRESETS,
  type DateRangePreset,
  isDateRangePreset,
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

  const onChange = (next: DateRangePreset) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", next);
    if (next !== "custom") {
      params.delete("from");
      params.delete("to");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (labeled) {
    return (
      <FilterSelect
        label="Date"
        icon={icon}
        value={value}
        displayValue={PRESET_LABELS[value]}
        isActive={value !== "last_30_days"}
        onValueChange={(next) => onChange(next as DateRangePreset)}
        className="w-[min(100%,10rem)] sm:w-[12.5rem]"
      >
        {DATE_RANGE_PRESETS.filter((preset) => preset !== "custom").map((preset) => (
          <FilterSelectItem key={preset} value={preset}>
            {PRESET_LABELS[preset]}
          </FilterSelectItem>
        ))}
      </FilterSelect>
    );
  }

  return (
    <Select value={value} onValueChange={(v) => v && onChange(v as DateRangePreset)}>
      <SelectTrigger className="glass-inset h-9 w-[min(100%,10rem)] rounded-full border-white/50 text-sm font-medium shadow-none sm:w-[12.5rem]">
        <SelectValue placeholder="Date range" />
      </SelectTrigger>
      <SelectContent align="start" side="bottom" alignItemWithTrigger={false}>
        {DATE_RANGE_PRESETS.filter((preset) => preset !== "custom").map((preset) => (
          <SelectItem key={preset} value={preset}>
            {PRESET_LABELS[preset]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
