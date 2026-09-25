import { redirect } from "next/navigation";

import { ActivitiesManager } from "@/components/modules/activities/activities-manager";
import { getSessionUser } from "@/lib/auth/session";
import { getActivityFilterOptions } from "@/lib/queries/activities/get-activity-filter-options";
import { listActivitiesPaginated } from "@/lib/queries/activities/list-activities";
import { parseActivityListParams } from "@/lib/validations/activities/activity-list-params";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ActivitiesPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const params = parseActivityListParams(await searchParams);
  const [data, filterOptions] = await Promise.all([
    listActivitiesPaginated(user, params),
    getActivityFilterOptions(user),
  ]);

  return <ActivitiesManager user={user} data={data} filterOptions={filterOptions} />;
}
