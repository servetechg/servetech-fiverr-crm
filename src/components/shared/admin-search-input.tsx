"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const [value, setValue] = useState(urlQuery);

  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

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
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-full pl-9 pr-9"
        aria-label="Search"
      />
      {value.length > 0 ? (
        <button
          type="button"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
          onClick={() => setValue("")}
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
