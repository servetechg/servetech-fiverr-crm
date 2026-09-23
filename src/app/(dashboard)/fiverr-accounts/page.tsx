import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { getModulePlaceholder } from "@/lib/utils/module-page";

const meta = getModulePlaceholder("/fiverr-accounts");

export default function FiverrAccountsPage() {
  return (
    <ModulePlaceholder
      title={meta.title}
      description={meta.description}
      phaseLabel="Phase 3 — Admin master data"
    />
  );
}
