import { NextResponse } from "next/server";

import { parseLeadsImportCsv } from "@/lib/csv/leads-csv";
import { getSessionUser } from "@/lib/auth/session";
import { importLeadsFromRows } from "@/lib/services/leads/lead-service";

export async function POST(request: Request): Promise<Response> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
  }

  const text = await file.text();

  try {
    const rows = parseLeadsImportCsv(text);
    const result = await importLeadsFromRows(user, rows);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
