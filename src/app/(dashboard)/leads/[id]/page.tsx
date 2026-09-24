import { notFound, redirect } from "next/navigation";

import { LeadDetailView } from "@/components/modules/leads/lead-detail-view";
import { getSessionUser } from "@/lib/auth/session";
import { getLeadDetail } from "@/lib/queries/leads/get-lead-detail";

type LeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    notFound();
  }

  const lead = await getLeadDetail(user, id);

  return <LeadDetailView lead={lead} />;
}
