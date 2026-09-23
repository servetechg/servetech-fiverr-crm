import {
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";

export const DATE_RANGE_PRESETS = [
  "all_time",
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "this_month",
  "last_month",
  "custom",
] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number];

export type ResolvedDateRange = {
  preset: DateRangePreset;
  from: Date | null;
  to: Date | null;
  label: string;
};

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

export function isDateRangePreset(value: string): value is DateRangePreset {
  return (DATE_RANGE_PRESETS as readonly string[]).includes(value);
}

export function resolveDateRange(
  preset: DateRangePreset,
  customFrom?: string | null,
  customTo?: string | null,
  now: Date = new Date(),
): ResolvedDateRange {
  if (preset === "all_time") {
    return { preset, from: null, to: null, label: PRESET_LABELS.all_time };
  }

  if (preset === "today") {
    return {
      preset,
      from: startOfDay(now),
      to: endOfDay(now),
      label: PRESET_LABELS.today,
    };
  }

  if (preset === "yesterday") {
    const day = subDays(now, 1);
    return {
      preset,
      from: startOfDay(day),
      to: endOfDay(day),
      label: PRESET_LABELS.yesterday,
    };
  }

  if (preset === "last_7_days") {
    return {
      preset,
      from: startOfDay(subDays(now, 6)),
      to: endOfDay(now),
      label: PRESET_LABELS.last_7_days,
    };
  }

  if (preset === "last_30_days") {
    return {
      preset,
      from: startOfDay(subDays(now, 29)),
      to: endOfDay(now),
      label: PRESET_LABELS.last_30_days,
    };
  }

  if (preset === "this_month") {
    return {
      preset,
      from: startOfMonth(now),
      to: endOfDay(now),
      label: PRESET_LABELS.this_month,
    };
  }

  if (preset === "last_month") {
    const lastMonth = subMonths(now, 1);
    return {
      preset,
      from: startOfMonth(lastMonth),
      to: endOfMonth(lastMonth),
      label: PRESET_LABELS.last_month,
    };
  }

  const from = customFrom ? startOfDay(new Date(customFrom)) : startOfDay(subDays(now, 29));
  const to = customTo ? endOfDay(new Date(customTo)) : endOfDay(now);

  return {
    preset: "custom",
    from,
    to,
    label: `${format(from, "yyyy-MM-dd")} – ${format(to, "yyyy-MM-dd")}`,
  };
}

export function parseDateRangeFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ResolvedDateRange {
  const presetParam = searchParams.range;
  const presetRaw = Array.isArray(presetParam) ? presetParam[0] : presetParam;
  const preset = presetRaw && isDateRangePreset(presetRaw) ? presetRaw : "last_30_days";

  const fromParam = searchParams.from;
  const toParam = searchParams.to;
  const from = Array.isArray(fromParam) ? fromParam[0] : fromParam;
  const to = Array.isArray(toParam) ? toParam[0] : toParam;

  return resolveDateRange(preset, from, to);
}
