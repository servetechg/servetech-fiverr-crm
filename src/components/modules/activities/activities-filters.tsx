"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  ACTIVITY_DIRECTION_LABELS,
  ACTIVITY_DIRECTION_OPTIONS,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_OPTIONS,
} from "@/lib/constants/activities";
import { isAdmin } from "@/lib/auth/rbac";
import {
  DATE_RANGE_PRESETS,
  type DateRangePreset,
  isDateRangePreset,
} from "@/lib/utils/date-range";
import { AdminSearchInput } from "@/components/shared/admin-search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { SessionUser } from "@/types/common/session-user";
import type { ActivityFormOptions } from "@/types/activities/activity-list-item";

const RANGE_LABELS: Record<DateRangePreset, string> = {
  all_time: "All Time",
  today: "Today",
  yesterday: "Yesterday",
  last_7_days: "Last 7 Days",
  last_30_days: "Last 30 Days",
  this_month: "This Month",
  last_month: "Last Month",
  custom: "Custom Range",
};

type ActivitiesFiltersProps = {
  user: SessionUser;
  formOptions: ActivityFormOptions;
};

function FilterSelect({
  label,
  value,
  displayValue,
  onValueChange,
  children,
}: {
  label: string;
  value: string;
  displayValue: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <Select value={value} onValueChange={(next) => next && onValueChange(next)}>
      <SelectTrigger className="glass-inset h-9 w-full rounded-full sm:w-[11rem]">
        <span className="flex min-w-0 items-center gap-1 truncate text-sm">
          <span className="shrink-0 text-muted-foreground">{label}:</span>
          <span className="truncate font-medium text-foreground">{displayValue}</span>
        </span>
      </SelectTrigger>
      <SelectContent className="rounded-2xl">{children}</SelectContent>
    </Select>
  );
}

export function ActivitiesFilters({ user, formOptions }: ActivitiesFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const setParam = (key: string, value: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const rangeParam = searchParams.get("range") ?? "all_time";
  const rangeValue: DateRangePreset =
    isDateRangePreset(rangeParam) ? rangeParam : "all_time";
  const typeParam = searchParams.get("type") ?? "all";
  const directionParam = searchParams.get("direction") ?? "all";
  const repParam = searchParams.get("salespersonId") ?? "all";

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
      <AdminSearchInput placeholder="Search notes, lead, or client…" className="xl:max-w-sm" />
      <FilterSelect
        label="Time"
        value={rangeValue}
        displayValue={RANGE_LABELS[rangeValue]}
        onValueChange={(value) => setParam("range", value)}
      >
        {DATE_RANGE_PRESETS.filter((preset) => preset !== "custom").map((preset) => (
          <SelectItem key={preset} value={preset}>
            {RANGE_LABELS[preset]}
          </SelectItem>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Type"
        value={typeParam}
        displayValue={
          typeParam === "all"
            ? "All"
            : ACTIVITY_TYPE_LABELS[typeParam as keyof typeof ACTIVITY_TYPE_LABELS] ?? typeParam
        }
        onValueChange={(value) => setParam("type", value)}
      >
        <SelectItem value="all">All</SelectItem>
        {ACTIVITY_TYPE_OPTIONS.map((type) => (
          <SelectItem key={type} value={type}>
            {ACTIVITY_TYPE_LABELS[type]}
          </SelectItem>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Direction"
        value={directionParam}
        displayValue={
          directionParam === "all"
            ? "All"
            : ACTIVITY_DIRECTION_LABELS[directionParam as keyof typeof ACTIVITY_DIRECTION_LABELS] ??
              directionParam
        }
        onValueChange={(value) => setParam("direction", value)}
      >
        <SelectItem value="all">All</SelectItem>
        {ACTIVITY_DIRECTION_OPTIONS.map((direction) => (
          <SelectItem key={direction} value={direction}>
            {ACTIVITY_DIRECTION_LABELS[direction]}
          </SelectItem>
        ))}
      </FilterSelect>
      {isAdmin(user) ? (
        <FilterSelect
          label="Rep"
          value={repParam}
          displayValue={
            repParam === "all"
              ? "All"
              : (formOptions.salespeople.find((rep) => String(rep.id) === repParam)?.fullName ??
                "All")
          }
          onValueChange={(value) => setParam("salespersonId", value)}
        >
          <SelectItem value="all">All</SelectItem>
          {formOptions.salespeople.map((rep) => (
            <SelectItem key={rep.id} value={String(rep.id)}>
              {rep.fullName}
            </SelectItem>
          ))}
        </FilterSelect>
      ) : null}
    </div>
  );
}
