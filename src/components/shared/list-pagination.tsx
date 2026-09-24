"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type ListPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  /** Singular noun for counts, e.g. "lead", "account", "service", "record" */
  entitySingular?: string;
};

export function ListPagination({
  page,
  totalPages,
  total,
  entitySingular = "lead",
}: ListPaginationProps) {
  const entityPlural = entitySingular === "record" ? "records" : `${entitySingular}s`;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (nextPage: number): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "No results"
          : `${total} ${total === 1 ? entitySingular : entityPlural} · Page ${page} of ${totalPages}`}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
