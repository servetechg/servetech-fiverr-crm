"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";

type ThemeToggleProps = {
  className?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
};

export function ThemeToggle({ className, tooltipSide = "top" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "glass-icon-button size-11 rounded-full text-muted-foreground shadow-sm hover:bg-muted/80 hover:text-foreground dark:hover:bg-muted/50",
              className,
            )}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            disabled={!mounted}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <Moon className="size-[1.125rem]" strokeWidth={1.75} />
            ) : (
              <Sun className="size-[1.125rem]" strokeWidth={1.75} />
            )}
          </Button>
        }
      />
      <TooltipContent side={tooltipSide}>
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </TooltipContent>
    </Tooltip>
  );
}

export function ThemeToggleDock() {
  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6"
      aria-hidden={false}
    >
      <div className="pointer-events-auto">
        <ThemeToggle tooltipSide="left" />
      </div>
    </div>
  );
}
