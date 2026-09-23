import { FiverrAccountsManager } from "@/components/modules/fiverr-accounts/fiverr-accounts-manager";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { listFiverrAccounts } from "@/lib/queries/fiverr-accounts/list-fiverr-accounts";

export default async function FiverrAccountsPage() {
  await requireAdminPage();
  const items = await listFiverrAccounts();
  return <FiverrAccountsManager items={items} />;
}
