"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { DateRangeFilter } from "@/components/layout/date-range-filter";
import { LeadsSearchInput } from "@/components/modules/leads/leads-search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { LEAD_PRIORITY_LABELS, LEAD_PRIORITY_OPTIONS, LEAD_STATUS_LABELS, LEAD_STATUS_OPTIONS } from "@/lib/constants/leads";
import type { LeadPriority, LeadStatus } from "@prisma/client";
import type { LeadFilterOptions } from "@/types/leads/lead-filter-options";
import type { SessionUser } from "@/types/common/session-user";

type LeadsFiltersProps = {
  filterOptions: LeadFilterOptions;
  user: SessionUser;
};

type FilterSelectProps = {
  label: string;
  value: string;
  displayValue: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
};

function FilterSelect({ label, value, displayValue, onValueChange, children, className }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => next && onValueChange(next)}>
      <SelectTrigger className={className ?? "glass-inset h-9 w-full rounded-full sm:w-[12.5rem]"}>
        <span className="flex min-w-0 items-center gap-1 truncate text-sm">
          <span className="shrink-0 text-muted-foreground">{label}:</span>
          <span className="truncate font-medium text-foreground">{displayValue}</span>
        </span>
      </SelectTrigger>
      <SelectContent className="rounded-2xl">{children}</SelectContent>
    </Select>
  );
}

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
      : LEAD_STATUS_LABELS[statusParam as LeadStatus] ?? statusParam;
  const priorityDisplay =
    priorityParam === "all"
      ? "All"
      : LEAD_PRIORITY_LABELS[priorityParam as LeadPriority] ?? priorityParam;
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
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <LeadsSearchInput />
      <FilterSelect
        label="Status"
        value={statusParam}
        displayValue={statusDisplay}
        onValueChange={(value) => setParam("status", value)}
      >
        <SelectItem value="all">All statuses</SelectItem>
        {LEAD_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Priority"
        value={priorityParam}
        displayValue={priorityDisplay}
        onValueChange={(value) => setParam("priority", value)}
        className="glass-inset h-9 w-full rounded-full sm:w-[11.5rem]"
      >
        <SelectItem value="all">All priorities</SelectItem>
        {LEAD_PRIORITY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Account"
        value={accountParam}
        displayValue={accountDisplay}
        onValueChange={(value) => setParam("fiverrAccountId", value)}
      >
        <SelectItem value="all">All accounts</SelectItem>
        {filterOptions.fiverrAccounts.map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.label}
          </SelectItem>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Service"
        value={serviceParam}
        displayValue={serviceDisplay}
        onValueChange={(value) => setParam("serviceId", value)}
      >
        <SelectItem value="all">All services</SelectItem>
        {filterOptions.services.map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.label}
          </SelectItem>
        ))}
      </FilterSelect>
      {user.role === "Admin" && (
        <FilterSelect
          label="Rep"
          value={repParam}
          displayValue={repDisplay}
          onValueChange={(value) => setParam("salespersonId", value)}
        >
          <SelectItem value="all">All reps</SelectItem>
          {filterOptions.salespeople.map((option) => (
            <SelectItem key={option.id} value={String(option.id)}>
              {option.label}
            </SelectItem>
          ))}
        </FilterSelect>
      )}
      <DateRangeFilter labeled />
    </div>
  );
}
