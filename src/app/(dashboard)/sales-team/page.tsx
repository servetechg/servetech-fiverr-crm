import { Suspense } from "react";

import { SalesTeamManager } from "@/components/modules/sales-team/sales-team-manager";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { listFiverrAccountOptions } from "@/lib/queries/fiverr-accounts/list-fiverr-accounts";
import { listSalesTeamPaginated } from "@/lib/queries/sales-team/list-sales-team";
import { parseSalesTeamListParams } from "@/lib/validations/sales-team/sales-team-list-params";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SalesTeamPage({ searchParams }: PageProps) {
  await requireAdminPage();
  const params = parseSalesTeamListParams(await searchParams);
  const [data, fiverrAccountOptions] = await Promise.all([
    listSalesTeamPaginated(params),
    listFiverrAccountOptions(),
  ]);

  return (
    <Suspense>
      <SalesTeamManager data={data} fiverrAccountOptions={fiverrAccountOptions} />
    </Suspense>
  );
}
