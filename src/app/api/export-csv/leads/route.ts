import { AuditCategory } from "@prisma/client";
import { NextResponse } from "next/server";

import { leadsToCsvRows } from "@/lib/csv/leads-csv";
import { getSessionUser } from "@/lib/auth/session";
import { listLeadsForExport } from "@/lib/queries/leads/list-leads";
import { recordAuditEvent } from "@/lib/services/audit/record-audit-event";
import { parseLeadListParams } from "@/lib/validations/leads/lead-list-params";

export async function GET(request: Request): Promise<Response> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const params = parseLeadListParams(Object.fromEntries(url.searchParams.entries()));
  const { page: _page, pageSize: _pageSize, ...filters } = params;

  const items = await listLeadsForExport(user, filters);
  const csv = leadsToCsvRows(items);

  await recordAuditEvent({
    userId: user.id,
    category: AuditCategory.Data,
    action: "export",
    summary: "Leads exported to CSV",
    details: `${items.length} lead(s) exported with current filters.`,
  });

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads-export.csv"',
    },
  });
}
