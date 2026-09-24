import { Suspense } from "react";

import { ServicesManager } from "@/components/modules/services/services-manager";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { listServicesPaginated } from "@/lib/queries/services/list-services";
import { parseServiceListParams } from "@/lib/validations/services/service-list-params";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ServicesPage({ searchParams }: PageProps) {
  await requireAdminPage();
  const params = parseServiceListParams(await searchParams);
  const data = await listServicesPaginated(params);

  return (
    <Suspense>
      <ServicesManager data={data} />
    </Suspense>
  );
}
