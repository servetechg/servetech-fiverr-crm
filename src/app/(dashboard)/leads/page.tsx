import { Suspense } from "react";
import { redirect } from "next/navigation";

import { LeadsPageClient } from "@/components/modules/leads/leads-page-client";
import { LeadsTableFallback } from "@/components/modules/leads/leads-table-fallback";
import { LeadsTableSection } from "@/components/modules/leads/leads-table-section";
import { getSessionUser } from "@/lib/auth/session";
import { getLeadFilterOptions } from "@/lib/queries/leads/lead-filter-options";

type LeadsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function searchParamsCacheKey(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, entry);
      }
    } else {
      params.set(key, value);
    }
  }
  return params.toString();
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const filterOptions = await getLeadFilterOptions();
  const tableKey = searchParamsCacheKey(resolvedSearchParams);

  return (
    <LeadsPageClient user={user} filterOptions={filterOptions}>
      <Suspense key={tableKey} fallback={<LeadsTableFallback />}>
        <LeadsTableSection user={user} searchParams={resolvedSearchParams} />
      </Suspense>
    </LeadsPageClient>
  );
}
