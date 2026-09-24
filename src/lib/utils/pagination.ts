import type { PaginatedResult, PaginationParams } from "@/types/common/pagination";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function parsePaginationParams(
  searchParams: Record<string, string | string[] | undefined>,
): PaginationParams {
  const pageRaw = searchParams.page;
  const pageSizeRaw = searchParams.pageSize;

  const pageStr = Array.isArray(pageRaw) ? pageRaw[0] : pageRaw;
  const pageSizeStr = Array.isArray(pageSizeRaw) ? pageSizeRaw[0] : pageSizeRaw;

  const page = Math.max(DEFAULT_PAGE, Number.parseInt(pageStr ?? "", 10) || DEFAULT_PAGE);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number.parseInt(pageSizeStr ?? "", 10) || DEFAULT_PAGE_SIZE),
  );

  return { page, pageSize };
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / params.pageSize));
  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages,
  };
}

export function paginationSkip(params: PaginationParams): number {
  return (params.page - 1) * params.pageSize;
}

export type PaginationRangeItem = number | "ellipsis";

export function getPaginationRange(page: number, totalPages: number): PaginationRangeItem[] {
  if (totalPages <= 1) {
    return [1];
  }
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (page <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }
  if (page >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
}
