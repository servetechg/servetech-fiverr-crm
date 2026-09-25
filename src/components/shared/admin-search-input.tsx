"use client";

import { X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchInputIcon } from "@/components/shared/search-input-icon";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type AdminSearchInputProps = {
  placeholder?: string;
  paramKey?: string;
  className?: string;
};

export function AdminSearchInput({
  placeholder = "Search…",
  paramKey = "q",
  className,
}: AdminSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const urlQuery = searchParams.get(paramKey) ?? "";
  const [localOverride, setLocalOverride] = useState<string | null>(null);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setLocalOverride(null);
  }

  const value = localOverride ?? urlQuery;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = value.trim();
      const current = searchParams.get(paramKey) ?? "";
      if (trimmed === current) {
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set(paramKey, trimmed);
      } else {
        params.delete(paramKey);
      }
      params.set("page", "1");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 350);
    return () => window.clearTimeout(handle);
  }, [paramKey, pathname, router, searchParams, value]);

  return (
    <div className={cn("relative min-w-0 flex-1 sm:max-w-xs", className)}>
      <SearchInputIcon />
      <Input
        value={value}
        onChange={(event) => setLocalOverride(event.target.value)}
        placeholder={placeholder}
        className="relative h-9 rounded-full pr-9 pl-10"
        aria-label="Search"
      />
      {value.length > 0 ? (
        <button
          type="button"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
          onClick={() => setLocalOverride("")}
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
