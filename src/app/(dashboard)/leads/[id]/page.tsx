import Link from "next/link";
import { notFound } from "next/navigation";

import { LeadPriorityBadge, LeadStatusBadge } from "@/components/modules/leads/lead-badges";
import { PageHeader } from "@/components/layout/page-header";
import { getSessionUser } from "@/lib/auth/session";
import { getLeadDetail } from "@/lib/queries/leads/get-lead-detail";
import { formatCurrency } from "@/lib/utils/format";
import { redirect } from "next/navigation";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={lead.leadCustomId}
        description={`${lead.clientName ?? lead.fiverrUsername} · ${lead.serviceName}`}
        actions={
          <Link
            href="/leads"
            className="inline-flex h-9 items-center rounded-full border border-white/50 px-4 text-sm font-medium"
          >
            Back to leads
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="journey-kpi-card space-y-3 p-5 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            <LeadStatusBadge status={lead.status} />
            <LeadPriorityBadge priority={lead.priority} />
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Date received</dt>
              <dd className="text-sm font-medium">{lead.dateReceived}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Follow-up</dt>
              <dd className="text-sm font-medium">{lead.followUpDate ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Account</dt>
              <dd className="text-sm font-medium">{lead.fiverrAccountName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Sales rep</dt>
              <dd className="text-sm font-medium">{lead.salespersonName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Est. value</dt>
              <dd className="text-sm font-medium">{formatCurrency(lead.estProjectValue)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Revenue</dt>
              <dd className="text-sm font-medium">{formatCurrency(lead.revenue)}</dd>
            </div>
          </dl>
          {lead.chatLink && (
            <p className="text-sm">
              <a href={lead.chatLink} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                Open Fiverr chat
              </a>
            </p>
          )}
          {lead.clientRequirement && (
            <div>
              <h2 className="text-sm font-semibold">Client requirement</h2>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{lead.clientRequirement}</p>
            </div>
          )}
          {lead.internalNotes && (
            <div>
              <h2 className="text-sm font-semibold">Internal notes</h2>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{lead.internalNotes}</p>
            </div>
          )}
          {lead.lostReason && (
            <div>
              <h2 className="text-sm font-semibold">Lost reason</h2>
              <p className="mt-1 text-sm text-muted-foreground">{lead.lostReason}</p>
            </div>
          )}
          {lead.lostChatProof && lead.lostChatProof.urls.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold">Chat proof</h2>
              <ul className="mt-2 space-y-1">
                {lead.lostChatProof.urls.map((url, index) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-2">
                      {lead.lostChatProof?.kind === "pdf" ? "View PDF" : `Screenshot ${index + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {lead.upsellEligible && (
            <p className="text-sm font-medium text-foreground">Marked upsell eligible</p>
          )}
        </div>

        <div className="journey-kpi-card p-5">
          <h2 className="text-sm font-semibold">Activity</h2>
          <ul className="mt-3 space-y-3">
            {lead.activities.length === 0 ? (
              <li className="text-sm text-muted-foreground">No activity yet.</li>
            ) : (
              lead.activities.map((activity) => (
                <li key={activity.id} className="rounded-xl bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.activityTime).toLocaleString()} · {activity.userName}
                  </p>
                  <p className="mt-1 text-sm">{activity.notes}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
