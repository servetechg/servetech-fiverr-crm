"use client";

import { forwardRef, useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, ...props }, ref) {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative" data-slot="password-input">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn("pr-11", className)}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute top-1/2 right-1.5 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground opacity-100 transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(195_245_60/0.35)]"
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={() => {
            setShowPassword((visible) => !visible);
          }}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff className="size-4 shrink-0" aria-hidden /> : <Eye className="size-4 shrink-0" aria-hidden />}
        </button>
      </div>
    );
  },
);
