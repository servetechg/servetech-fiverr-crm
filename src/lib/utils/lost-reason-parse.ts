import {
  LOST_REASON_LABELS,
  LOST_REASON_OPTIONS,
  LOST_REASON_VALUES,
  type LostReasonValue,
} from "@/lib/constants/lost-reasons";

export function parseLostReasonFromDb(stored: string | null): LostReasonValue | undefined {
  if (!stored) {
    return undefined;
  }

  if ((LOST_REASON_VALUES as readonly string[]).includes(stored)) {
    return stored as LostReasonValue;
  }

  const byLabel = LOST_REASON_OPTIONS.find((option) => option.label === stored);
  if (byLabel) {
    return byLabel.value;
  }

  const byLabelCaseInsensitive = LOST_REASON_OPTIONS.find(
    (option) => option.label.toLowerCase() === stored.toLowerCase(),
  );
  return byLabelCaseInsensitive?.value;
}

export function lostReasonDisplay(stored: string | null): string | null {
  if (!stored) {
    return null;
  }
  const value = parseLostReasonFromDb(stored);
  return value ? LOST_REASON_LABELS[value] : stored;
}
