"use client";

import { usePathname } from "next/navigation";

import { DateRangeFilter } from "@/components/layout/date-range-filter";

/** Dashboard home only — module pages (e.g. leads) use their own date filters. */
export function TopbarDateRangeSlot() {
  const pathname = usePathname();
  if (pathname !== "/") {
    return null;
  }

  return <DateRangeFilter labeled />;
}
