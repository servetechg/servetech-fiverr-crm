import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableShell } from "@/components/shared/data-table-shell";
import type { SessionUser } from "@/types/common/session-user";
import { isAdmin } from "@/lib/auth/rbac";
import { parseDateRangeFromSearchParams } from "@/lib/utils/date-range";
import type { ColumnDef } from "@tanstack/react-table";

type DashboardOverviewProps = {
  user: SessionUser;
  searchParams: Record<string, string | string[] | undefined>;
};

type PlaceholderKpi = {
  label: string;
  value: string;
  hint?: string;
};

const demoColumns: ColumnDef<{ stage: string; count: string }, unknown>[] = [
  { accessorKey: "stage", header: "Stage" },
  { accessorKey: "count", header: "Count" },
];

const demoFunnel = [
  { stage: "Fiverr Messages / Leads", count: "—" },
  { stage: "Quotes Sent", count: "—" },
  { stage: "Orders Won", count: "—" },
  { stage: "Upsell Offered", count: "—" },
  { stage: "Upsell Accepted", count: "—" },
];

export function DashboardOverview({ user, searchParams }: DashboardOverviewProps) {
  const range = parseDateRangeFromSearchParams(searchParams);
  const scopeLabel = isAdmin(user) ? "Company-wide" : "Personal";

  const kpis: PlaceholderKpi[] = [
    { label: "Leads Received", value: "—" },
    { label: "Quotes Sent", value: "—" },
    { label: "Orders Won", value: "—", hint: "—% of leads" },
    { label: "Front Revenue", value: "—" },
    { label: "Upsell Revenue", value: "—" },
    { label: "Total Revenue", value: "—" },
    { label: "Upsells Accepted", value: "—" },
    { label: "Pending Follow-ups", value: "—" },
    { label: "Overdue Follow-ups", value: "—" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`${scopeLabel} performance overview for your Fiverr pipeline.`}
        meta={`Range: ${range.label}`}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="journey-kpi-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
              {kpi.hint && <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Sales funnel</h2>
        <DataTableShell columns={demoColumns} data={demoFunnel} emptyMessage="No funnel data yet." />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          "Leads by Day",
          "Orders by Day",
          "Revenue by Day",
          "Leads by Fiverr Account",
          "Salesperson Performance",
          "Lost Lead Reasons",
        ].map((chartTitle) => (
          <Card key={chartTitle} className="journey-kpi-card min-h-44 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">{chartTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-20 items-center justify-center rounded-2xl bg-muted/60">
                <p className="text-xs text-muted-foreground">Charts ship in Phase 7.</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
