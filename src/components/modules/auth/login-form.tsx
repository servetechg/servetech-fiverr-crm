"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";

import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "cn";

type LoginFormProps = {
  callbackUrl?: string;
};

const fieldClassName =
  "h-11 rounded-full border-white/55 px-4 shadow-none focus-visible:ring-[3px] focus-visible:ring-[rgb(195_245_60/0.28)]";

export function LoginForm({ callbackUrl = "/" }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fieldErrors = state && !state.success ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      {state && !state.success && !fieldErrors && (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/35 bg-destructive/8 px-4 py-2.5 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground/85">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@servetech.global"
          className={fieldClassName}
          aria-invalid={Boolean(fieldErrors?.email?.[0])}
        />
        {fieldErrors?.email?.[0] && (
          <p className="px-1 text-xs text-destructive">{fieldErrors.email[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground/85">
          Password
        </Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          className={cn(fieldClassName, "pr-12")}
          aria-invalid={Boolean(fieldErrors?.password?.[0])}
        />
        {fieldErrors?.password?.[0] && (
          <p className="px-1 text-xs text-destructive">{fieldErrors.password[0]}</p>
        )}
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-11 w-full rounded-full text-[0.9375rem] font-semibold shadow-[0_6px_20px_rgb(195_245_60/0.35)] transition-shadow hover:shadow-[0_8px_24px_rgb(195_245_60/0.42)]"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
