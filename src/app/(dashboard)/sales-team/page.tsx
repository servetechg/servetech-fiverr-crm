import { SalesTeamManager } from "@/components/modules/sales-team/sales-team-manager";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { listSalesTeam } from "@/lib/queries/sales-team/list-sales-team";

export default async function SalesTeamPage() {
  await requireAdminPage();
  const items = await listSalesTeam();
  return <SalesTeamManager items={items} />;
}
