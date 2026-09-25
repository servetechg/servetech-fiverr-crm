export const TABLE_PAGE_SIZE_OPTIONS = [100, 200, 300] as const;

export type TablePageSize = (typeof TABLE_PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_TABLE_PAGE_SIZE = 100;

export function parseTablePageSize(value: string | undefined): TablePageSize {
  const parsed = Number.parseInt(value ?? "", 10);
  if (TABLE_PAGE_SIZE_OPTIONS.includes(parsed as TablePageSize)) {
    return parsed as TablePageSize;
  }
  return DEFAULT_TABLE_PAGE_SIZE;
}
