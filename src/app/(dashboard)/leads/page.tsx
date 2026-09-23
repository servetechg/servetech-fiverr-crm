import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { getModulePlaceholder } from "@/lib/utils/module-page";

const meta = getModulePlaceholder("/leads");

export default function LeadsPage() {
  return <ModulePlaceholder title={meta.title} description={meta.description} phaseLabel="Phase 4 — Leads CRUD, filters, CSV" />;
}
