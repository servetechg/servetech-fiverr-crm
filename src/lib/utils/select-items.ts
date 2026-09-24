export function selectItemsById(
  rows: readonly { id: number; label: string }[],
): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [String(row.id), row.label]));
}

export function selectItemsByIdFullName(
  rows: readonly { id: number; fullName: string }[],
): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [String(row.id), row.fullName]));
}

export function selectItemsFromLabels<T extends string>(
  labels: Record<T, string>,
): Record<string, string> {
  return labels;
}
