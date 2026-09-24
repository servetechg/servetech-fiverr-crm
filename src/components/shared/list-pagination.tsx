"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getPaginationRange } from "@/lib/utils/pagination";
import { cn } from "@/lib/utils/cn";

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

  const range = getPaginationRange(page, totalPages);

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "No results"
          : `${total} ${total === 1 ? entitySingular : entityPlural} · Page ${page} of ${totalPages}`}
      </p>
      <nav
        className="flex flex-wrap items-center justify-center gap-1 sm:justify-end"
        aria-label="Pagination"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 rounded-md px-2.5 text-muted-foreground hover:text-foreground"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <div className="flex items-center gap-0.5 px-1">
          {range.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1.5 text-sm text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "size-8 min-w-8 rounded-md p-0 text-sm font-medium",
                  item === page && "shadow-sm",
                )}
                aria-current={item === page ? "page" : undefined}
                onClick={() => goToPage(item)}
              >
                {item}
              </Button>
            ),
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 rounded-md px-2.5 text-muted-foreground hover:text-foreground"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </nav>
    </>
  );
}
