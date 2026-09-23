import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { getModulePlaceholder } from "@/lib/utils/module-page";

const meta = getModulePlaceholder("/services");

export default function ServicesPage() {
  return (
    <ModulePlaceholder
      title={meta.title}
      description={meta.description}
      phaseLabel="Phase 3 — Service catalog"
    />
  );
}
