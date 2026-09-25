import { format, isValid, parse } from "date-fns";

export const DATE_INPUT_FORMAT = "yyyy-MM-dd";

export function parseDateInput(value: string | undefined | null): Date | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = parse(value.trim(), DATE_INPUT_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function formatDateInput(date: Date | undefined | null): string {
  if (!date || !isValid(date)) {
    return "";
  }
  return format(date, DATE_INPUT_FORMAT);
}

export function formatDateTimeDisplay(iso: string): string {
  const date = new Date(iso);
  if (!isValid(date)) {
    return iso;
  }
  return format(date, "MMM d, yyyy · h:mm a");
}

export function formatDateDisplay(value: string | undefined | null): string {
  const date = parseDateInput(value ?? "");
  if (!date) {
    return "";
  }
  return format(date, "MMM d, yyyy");
}
