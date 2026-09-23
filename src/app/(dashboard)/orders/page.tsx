import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { getModulePlaceholder } from "@/lib/utils/module-page";

const meta = getModulePlaceholder("/orders");

export default function OrdersPage() {
  return (
    <ModulePlaceholder
      title={meta.title}
      description={meta.description}
      phaseLabel="Phase 6 — Orders & revenue rules"
    />
  );
}
