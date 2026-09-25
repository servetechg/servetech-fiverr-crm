import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CircleDollarSign,
  ExternalLink,
  MessageSquareText,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ChatProofTableCell } from "@/components/modules/leads/chat-proof-table-cell";
import { LeadPriorityBadge, LeadStatusBadge } from "@/components/modules/leads/lead-badges";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTimeDisplay } from "@/lib/utils/date-input";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { LeadDetail } from "@/types/leads/lead-detail";

type LeadDetailViewProps = {
  lead: LeadDetail;
};

type MetricTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  emphasis?: boolean;
};

function MetricTile({ icon: Icon, label, value, emphasis }: MetricTileProps) {
  return (
    <div
      className={cn(
        "glass-inset flex flex-col gap-2 rounded-2xl p-4 transition-colors",
        emphasis && "border-[rgb(195_245_60/0.35)] bg-[rgb(195_245_60/0.08)]",
      )}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
        {label}
      </div>
      <p className={cn("font-semibold tracking-tight text-foreground", emphasis ? "text-xl" : "text-sm")}>
        {value}
      </p>
    </div>
  );
}

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="rounded-2xl border border-white/55 bg-white/30 p-4 sm:p-5">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function LeadDetailView({ lead }: LeadDetailViewProps) {
  const clientLabel = lead.clientName ?? lead.fiverrUsername;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <LeadStatusBadge status={lead.status} />
            <LeadPriorityBadge priority={lead.priority} />
            {lead.upsellEligible && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#C3F53C]/20 px-2.5 py-0.5 text-xs font-medium text-foreground">
                <Sparkles className="size-3" aria-hidden />
                Upsell eligible
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
              {lead.leadCustomId}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/90">{clientLabel}</span>
              <span className="text-muted-foreground/80"> · </span>
              {lead.serviceName}
            </p>
          </div>
        </div>
        <Link
          href="/leads"
          className={cn(buttonVariants({ variant: "outline" }), "h-9 shrink-0 rounded-full border-white/55 px-4")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to leads
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricTile icon={CircleDollarSign} label="Est. project value" value={formatCurrency(lead.estProjectValue)} emphasis />
        <MetricTile icon={Wallet} label="Revenue" value={formatCurrency(lead.revenue)} emphasis />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <Card className="glass-surface gap-0 overflow-hidden rounded-[1.75rem] border-white/60 py-0 ring-1 ring-white/40 lg:col-span-2">
          <CardHeader className="border-b border-white/50 px-5 py-4 sm:px-6">
            <CardTitle className="text-base font-semibold tracking-tight">Lead overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricTile icon={CalendarClock} label="Date received" value={lead.dateReceived} />
              <MetricTile
                icon={CalendarClock}
                label="Follow-up"
                value={lead.followUpDate ?? "Not scheduled"}
              />
              <MetricTile icon={UserRound} label="Fiverr account" value={lead.fiverrAccountName} />
              <MetricTile icon={UserRound} label="Sales rep" value={lead.salespersonName} />
            </div>

            {lead.chatLink && (
              <a
                href={lead.chatLink}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 w-full justify-center rounded-full border-white/55 sm:w-auto sm:px-5",
                )}
              >
                <MessageSquareText className="size-4" aria-hidden />
                Open Fiverr chat
                <ExternalLink className="size-3.5 opacity-60" aria-hidden />
              </a>
            )}

            {(lead.clientRequirement ||
              lead.internalNotes ||
              lead.lostReason ||
              (lead.lostChatProof && lead.lostChatProof.urls.length > 0)) && (
              <div className="space-y-3 border-t border-white/45 pt-5">
                {lead.clientRequirement && (
                  <DetailSection title="Client requirement">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                      {lead.clientRequirement}
                    </p>
                  </DetailSection>
                )}
                {lead.internalNotes && (
                  <DetailSection title="Internal notes">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                      {lead.internalNotes}
                    </p>
                  </DetailSection>
                )}
                {lead.lostReason && (
                  <DetailSection title="Lost reason">
                    <p className="text-sm font-medium text-foreground/90">{lead.lostReason}</p>
                  </DetailSection>
                )}
                {lead.lostChatProof && lead.lostChatProof.urls.length > 0 && (
                  <DetailSection title="Chat proof">
                    <ChatProofTableCell
                      proof={lead.lostChatProof}
                      leadCustomId={lead.leadCustomId}
                      clientLabel={clientLabel}
                    />
                  </DetailSection>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-surface gap-0 overflow-hidden rounded-[1.75rem] border-white/60 py-0 ring-1 ring-white/40">
          <CardHeader className="border-b border-white/50 px-5 py-4 sm:px-6">
            <CardTitle className="text-base font-semibold tracking-tight">Activity log</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
            {lead.activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/60 bg-white/25 px-4 py-10 text-center">
                <MessageSquareText className="size-8 text-muted-foreground/50" aria-hidden />
                <p className="mt-3 text-sm font-medium text-foreground/80">No activity yet</p>
                <p className="mt-1 max-w-[14rem] text-xs leading-relaxed text-muted-foreground">
                  CRM actions on this lead are recorded automatically.
                </p>
              </div>
            ) : (
              <ul className="relative space-y-0">
                {lead.activities.map((activity, index) => {
                  const isLast = index === lead.activities.length - 1;
                  return (
                    <li key={activity.id} className="relative flex gap-3 pb-6 last:pb-0">
                      {!isLast && (
                        <span
                          className="absolute top-3 left-[0.4375rem] h-[calc(100%-0.25rem)] w-px bg-border/80"
                          aria-hidden
                        />
                      )}
                      <span
                        className="relative z-[1] mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-[#C3F53C] bg-background"
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1 rounded-2xl border border-white/50 bg-white/35 p-3.5">
                        <p className="text-xs text-muted-foreground">
                          {formatDateTimeDisplay(activity.activityTime)}
                          <span className="text-muted-foreground/70"> · </span>
                          <span className="font-medium text-foreground/75">{activity.userName}</span>
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-foreground/90">
                          {activity.summary}
                        </p>
                        {activity.details ? (
                          <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                            {activity.details}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
