"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";

import { SearchInputIcon } from "@/components/shared/search-input-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 450;

function buildQueryString(params: URLSearchParams): string {
  const value = params.toString();
  return value ? `?${value}` : "";
}

export function LeadsSearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const urlQuery = searchParams.get("q") ?? "";
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFocusedRef = useRef(false);
  const latestInputRef = useRef(urlQuery);

  useEffect(() => {
    latestInputRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    if (isFocusedRef.current && searchQuery !== urlQuery) {
      return;
    }
    setSearchQuery(urlQuery);
  }, [urlQuery, searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const commitSearch = (raw: string, immediate = false): void => {
    const trimmed = raw.trim();
    const apply = (): void => {
      const params = new URLSearchParams(window.location.search);
      const current = params.get("q") ?? "";
      if (trimmed === current) {
        return;
      }
      if (!trimmed) {
        params.delete("q");
      } else {
        params.set("q", trimmed);
      }
      params.set("page", "1");
      startTransition(() => {
        router.replace(`${pathname}${buildQueryString(params)}`, { scroll: false });
      });
    };

    if (immediate) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      apply();
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(apply, DEBOUNCE_MS);
  };

  const clearSearch = (): void => {
    setSearchQuery("");
    commitSearch("", true);
  };

  return (
    <div className="relative w-full max-w-md">
      <SearchInputIcon />
      <Input
        type="search"
        enterKeyHint="search"
        placeholder="Search lead ID, client, or username"
        aria-label="Search leads"
        className={cn(
          "h-10 rounded-full pr-20 pl-10 text-sm",
          isPending && "opacity-90",
        )}
        value={searchQuery}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
        }}
        onChange={(event) => {
          const next = event.target.value;
          setSearchQuery(next);
          commitSearch(next);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitSearch(latestInputRef.current, true);
          }
          if (event.key === "Escape") {
            event.preventDefault();
            clearSearch();
          }
        }}
      />
      <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
        {isPending ? <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden /> : null}
        {searchQuery.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 rounded-full px-2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
            onClick={clearSearch}
          >
            <X className="size-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
