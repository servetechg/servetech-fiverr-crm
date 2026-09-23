import { LeadsTableView } from "@/components/modules/leads/leads-table-view";
import { listLeads } from "@/lib/queries/leads/list-leads";
import { parseLeadListParams } from "@/lib/validations/leads/lead-list-params";
import type { SessionUser } from "@/types/common/session-user";

type LeadsTableSectionProps = {
  user: SessionUser;
  searchParams: Record<string, string | string[] | undefined>;
};

export async function LeadsTableSection({ user, searchParams }: LeadsTableSectionProps) {
  const params = parseLeadListParams(searchParams);
  const data = await listLeads(user, params);
  return <LeadsTableView data={data} />;
}
