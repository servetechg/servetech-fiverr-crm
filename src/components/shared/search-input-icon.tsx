import { Search } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type SearchInputIconProps = {
  className?: string;
};

export function SearchInputIcon({ className }: SearchInputIconProps) {
  return (
    <Search
      className={cn(
        "pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-foreground/45",
        className,
      )}
      aria-hidden
    />
  );
}
