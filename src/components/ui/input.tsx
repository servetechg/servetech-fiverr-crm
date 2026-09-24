import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "glass-field h-10 w-full min-w-0 rounded-xl border border-[var(--field-border)] bg-[var(--field-bg)] px-3 py-2 text-base text-foreground shadow-[inset_0_1px_2px_rgb(20_20_20/0.04)] transition-all duration-200 ease-out outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-[rgb(195_245_60/0.55)] focus-visible:ring-[3px] focus-visible:ring-[rgb(195_245_60/0.22)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
