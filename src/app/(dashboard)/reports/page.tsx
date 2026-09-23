import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { getModulePlaceholder } from "@/lib/utils/module-page";

const meta = getModulePlaceholder("/reports");

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      title={meta.title}
      description={meta.description}
      phaseLabel="Phase 7 — Analytics reports"
    />
  );
}
