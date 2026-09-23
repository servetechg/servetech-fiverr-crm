import { LeadPriority, LeadStatus } from "@prisma/client";

import { LEAD_PRIORITY_LABELS, LEAD_STATUS_LABELS } from "@/lib/constants/leads";
import { parseCsv, stringifyCsv } from "@/lib/csv/csv-utils";
import type { LeadCsvImportRow } from "@/lib/services/leads/lead-service";
import type { LeadExportRow } from "@/lib/queries/leads/list-leads";

export const LEAD_CSV_HEADERS = [
  "leadCustomId",
  "dateReceived",
  "clientName",
  "fiverrUsername",
  "fiverrAccountName",
  "salespersonEmail",
  "serviceName",
  "status",
  "priority",
  "estProjectValue",
  "actualRevenue",
  "followUpDate",
  "clientRequirement",
  "internalNotes",
  "lostReason",
] as const;

const IMPORT_HEADERS = [
  "leadCustomId",
  "dateReceived",
  "fiverrUsername",
  "fiverrAccountName",
  "salespersonEmail",
  "serviceName",
  "status",
  "priority",
  "estProjectValue",
] as const;

function parseLeadStatus(value: string): LeadStatus | null {
  const trimmed = value.trim();
  if ((Object.values(LeadStatus) as string[]).includes(trimmed)) {
    return trimmed as LeadStatus;
  }
  const byLabel = Object.entries(LEAD_STATUS_LABELS).find(
    ([, label]) => label.toLowerCase() === trimmed.toLowerCase(),
  );
  return byLabel ? (byLabel[0] as LeadStatus) : null;
}

function parseLeadPriority(value: string): LeadPriority | null {
  const trimmed = value.trim();
  if ((Object.values(LeadPriority) as string[]).includes(trimmed)) {
    return trimmed as LeadPriority;
  }
  const byLabel = Object.entries(LEAD_PRIORITY_LABELS).find(
    ([, label]) => label.toLowerCase() === trimmed.toLowerCase(),
  );
  return byLabel ? (byLabel[0] as LeadPriority) : null;
}

export function leadsToCsvRows(items: LeadExportRow[]): string {
  const rows = items.map((item) => [
    item.leadCustomId,
    item.dateReceived,
    item.clientName ?? "",
    item.fiverrUsername,
    item.fiverrAccountName,
    item.salespersonEmail,
    item.serviceName,
    LEAD_STATUS_LABELS[item.status],
    LEAD_PRIORITY_LABELS[item.priority],
    String(item.estProjectValue),
    String(item.revenue),
    item.followUpDate ?? "",
    item.clientRequirement ?? "",
    item.internalNotes ?? "",
    item.lostReason ?? "",
  ]);

  return stringifyCsv([...LEAD_CSV_HEADERS], rows);
}

export function parseLeadsImportCsv(text: string): LeadCsvImportRow[] {
  const parsed = parseCsv(text);
  if (parsed.length === 0) {
    return [];
  }

  const headerRow = parsed[0];
  if (!headerRow) {
    return [];
  }
  const header = headerRow.map((cell) => cell.trim());
  const headerIndex = new Map(header.map((name, index) => [name, index]));

  for (const required of IMPORT_HEADERS) {
    if (!headerIndex.has(required)) {
      throw new Error(`Missing CSV column: ${required}`);
    }
  }

  const rows: LeadCsvImportRow[] = [];

  for (let lineIndex = 1; lineIndex < parsed.length; lineIndex += 1) {
    const cells = parsed[lineIndex];
    if (!cells) {
      continue;
    }
    const get = (name: (typeof IMPORT_HEADERS)[number]): string => {
      const index = headerIndex.get(name);
      return index === undefined ? "" : (cells[index] ?? "").trim();
    };

    const leadCustomId = get("leadCustomId");
    if (!leadCustomId) {
      continue;
    }

    const status = parseLeadStatus(get("status"));
    const priority = parseLeadPriority(get("priority"));
    const estProjectValue = Number.parseFloat(get("estProjectValue"));

    if (!status || !priority || Number.isNaN(estProjectValue)) {
      throw new Error(`Invalid data on row ${lineIndex + 1} (${leadCustomId}).`);
    }

    rows.push({
      leadCustomId,
      dateReceived: get("dateReceived"),
      fiverrUsername: get("fiverrUsername"),
      fiverrAccountName: get("fiverrAccountName"),
      salespersonEmail: get("salespersonEmail"),
      serviceName: get("serviceName"),
      status,
      priority,
      estProjectValue,
    });
  }

  return rows;
}
