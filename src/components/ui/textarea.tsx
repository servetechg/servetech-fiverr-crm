import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "glass-field field-sizing-content min-h-24 w-full rounded-xl border border-[var(--field-border)] bg-[var(--field-bg)] px-3 py-2.5 text-base text-foreground shadow-[inset_0_1px_2px_rgb(20_20_20/0.04)] transition-all duration-200 ease-out outline-none placeholder:text-muted-foreground focus-visible:border-[rgb(195_245_60/0.55)] focus-visible:ring-[3px] focus-visible:ring-[rgb(195_245_60/0.22)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
