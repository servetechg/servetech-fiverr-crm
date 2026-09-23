import { ServicesManager } from "@/components/modules/services/services-manager";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { listServices } from "@/lib/queries/services/list-services";

export default async function ServicesPage() {
  await requireAdminPage();
  const items = await listServices();
  return <ServicesManager items={items} />;
}
