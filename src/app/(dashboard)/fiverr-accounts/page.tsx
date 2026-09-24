import { Suspense } from "react";

import { FiverrAccountsManager } from "@/components/modules/fiverr-accounts/fiverr-accounts-manager";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { listFiverrAccountsPaginated } from "@/lib/queries/fiverr-accounts/list-fiverr-accounts";
import { parseFiverrAccountListParams } from "@/lib/validations/fiverr-accounts/account-list-params";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FiverrAccountsPage({ searchParams }: PageProps) {
  await requireAdminPage();
  const params = parseFiverrAccountListParams(await searchParams);
  const data = await listFiverrAccountsPaginated(params);

  return (
    <Suspense>
      <FiverrAccountsManager data={data} />
    </Suspense>
  );
}
