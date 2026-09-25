"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "@/lib/utils/cn";

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ className, ...props }: PopoverPrimitive.Trigger.Props) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={cn("cursor-pointer disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">;

function PopoverContent({
  className,
  side = "bottom",
  sideOffset = 10,
  align = "start",
  alignOffset = 0,
  children,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "glass-surface scroll-surface z-50 w-auto rounded-2xl p-0 text-popover-foreground shadow-[0_16px_40px_rgb(20_20_20/0.12)] ring-1 ring-border/60 outline-none data-[side=bottom]:origin-top data-[side=top]:origin-bottom data-open:animate-select-dropdown-in data-closed:animate-select-dropdown-out dark:shadow-[0_16px_40px_rgb(0_0_0/0.45)]",
            className,
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
