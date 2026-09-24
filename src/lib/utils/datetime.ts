export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const normalizedTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  const combined = new Date(`${dateStr}T${normalizedTime}`);
  if (Number.isNaN(combined.getTime())) {
    throw new Error("Invalid date or time.");
  }
  return combined;
}

/** Parse `YYYY-MM-DD` for DB `@db.Date` fields (UTC calendar date, no local drift). */
export function parseDateOnlyForDb(value: string): Date {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    throw new Error("Invalid date.");
  }
  const year = Number.parseInt(match[1] ?? "", 10);
  const month = Number.parseInt(match[2] ?? "", 10);
  const day = Number.parseInt(match[3] ?? "", 10);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date.");
  }
  return parsed;
}

/** Format a DB date-only value as `YYYY-MM-DD` (UTC calendar components). */
export function formatDateOnlyFromDb(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseOptionalDateOnly(value: string | undefined): Date | null {
  if (!value || value.trim() === "") {
    return null;
  }
  return parseDateOnlyForDb(value);
}

export function parseRequiredDateOnly(value: string): Date {
  const parsed = parseOptionalDateOnly(value);
  if (!parsed) {
    throw new Error("Date is required.");
  }
  return parsed;
}

export function formatTimeForInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
