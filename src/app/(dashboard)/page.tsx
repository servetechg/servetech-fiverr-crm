import { getSessionUser } from "@/lib/auth/session";
import { DashboardOverview } from "@/components/modules/dashboard/dashboard-overview";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  const params = await searchParams;

  return <DashboardOverview user={user} searchParams={params} />;
}
