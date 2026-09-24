"use client";

import type { LeadPriority, LeadStatus } from "@prisma/client";
import { BriefcaseBusiness, CalendarRange, CircleDot, Flame, Store, Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { DateRangeFilter } from "@/components/layout/date-range-filter";
import { LeadsSearchInput } from "@/components/modules/leads/leads-search-input";
import { FilterSelect, FilterSelectItem } from "@/components/shared/filter-select";
import { LEAD_PRIORITY_LABELS, LEAD_PRIORITY_OPTIONS, LEAD_STATUS_LABELS, LEAD_STATUS_OPTIONS } from "@/lib/constants/leads";
import type { SessionUser } from "@/types/common/session-user";
import type { LeadFilterOptions } from "@/types/leads/lead-filter-options";

type LeadsFiltersProps = {
  filterOptions: LeadFilterOptions;
  user: SessionUser;
};

export function LeadsFilters({ filterOptions, user }: LeadsFiltersProps) {
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

  const statusParam = searchParams.get("status") ?? "all";
  const priorityParam = searchParams.get("priority") ?? "all";
  const accountParam = searchParams.get("fiverrAccountId") ?? "all";
  const serviceParam = searchParams.get("serviceId") ?? "all";
  const repParam = searchParams.get("salespersonId") ?? "all";

  const statusDisplay =
    statusParam === "all"
      ? "All"
      : (LEAD_STATUS_LABELS[statusParam as LeadStatus] ?? statusParam);
  const priorityDisplay =
    priorityParam === "all"
      ? "All"
      : (LEAD_PRIORITY_LABELS[priorityParam as LeadPriority] ?? priorityParam);
  const accountDisplay =
    accountParam === "all"
      ? "All"
      : (filterOptions.fiverrAccounts.find((option) => String(option.id) === accountParam)?.label ?? "All");
  const serviceDisplay =
    serviceParam === "all"
      ? "All"
      : (filterOptions.services.find((option) => String(option.id) === serviceParam)?.label ?? "All");
  const repDisplay =
    repParam === "all"
      ? "All"
      : (filterOptions.salespeople.find((option) => String(option.id) === repParam)?.label ?? "All");

  return (
    <div className="glass-surface rounded-2xl border-white/55 p-3 ring-1 ring-white/40 sm:rounded-[1.25rem] sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <LeadsSearchInput />
        <FilterSelect
          label="Status"
          icon={CircleDot}
          value={statusParam}
          displayValue={statusDisplay}
          isActive={statusParam !== "all"}
          onValueChange={(value) => setParam("status", value)}
        >
          <FilterSelectItem value="all">All statuses</FilterSelectItem>
          {LEAD_STATUS_OPTIONS.map((option) => (
            <FilterSelectItem key={option.value} value={option.value}>
              {option.label}
            </FilterSelectItem>
          ))}
        </FilterSelect>
        <FilterSelect
          label="Priority"
          icon={Flame}
          value={priorityParam}
          displayValue={priorityDisplay}
          isActive={priorityParam !== "all"}
          onValueChange={(value) => setParam("priority", value)}
          className="sm:w-[11.5rem]"
        >
          <FilterSelectItem value="all">All priorities</FilterSelectItem>
          {LEAD_PRIORITY_OPTIONS.map((option) => (
            <FilterSelectItem key={option.value} value={option.value}>
              {option.label}
            </FilterSelectItem>
          ))}
        </FilterSelect>
        <FilterSelect
          label="Account"
          icon={Store}
          value={accountParam}
          displayValue={accountDisplay}
          isActive={accountParam !== "all"}
          onValueChange={(value) => setParam("fiverrAccountId", value)}
        >
          <FilterSelectItem value="all">All accounts</FilterSelectItem>
          {filterOptions.fiverrAccounts.map((option) => (
            <FilterSelectItem key={option.id} value={String(option.id)}>
              {option.label}
            </FilterSelectItem>
          ))}
        </FilterSelect>
        <FilterSelect
          label="Service"
          icon={BriefcaseBusiness}
          value={serviceParam}
          displayValue={serviceDisplay}
          isActive={serviceParam !== "all"}
          onValueChange={(value) => setParam("serviceId", value)}
        >
          <FilterSelectItem value="all">All services</FilterSelectItem>
          {filterOptions.services.map((option) => (
            <FilterSelectItem key={option.id} value={String(option.id)}>
              {option.label}
            </FilterSelectItem>
          ))}
        </FilterSelect>
        {user.role === "Admin" ? (
          <FilterSelect
            label="Rep"
            icon={Users}
            value={repParam}
            displayValue={repDisplay}
            isActive={repParam !== "all"}
            onValueChange={(value) => setParam("salespersonId", value)}
          >
            <FilterSelectItem value="all">All reps</FilterSelectItem>
            {filterOptions.salespeople.map((option) => (
              <FilterSelectItem key={option.id} value={String(option.id)}>
                {option.label}
              </FilterSelectItem>
            ))}
          </FilterSelect>
        ) : null}
        <DateRangeFilter labeled icon={CalendarRange} />
      </div>
    </div>
  );
}
