import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { getModulePlaceholder } from "@/lib/utils/module-page";

const meta = getModulePlaceholder("/follow-ups");

export default function FollowUpsPage() {
  return (
    <ModulePlaceholder
      title={meta.title}
      description={meta.description}
      phaseLabel="Phase 5 — Follow-up queue"
    />
  );
}
