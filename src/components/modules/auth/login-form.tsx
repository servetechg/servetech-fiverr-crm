"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  callbackUrl?: string;
};

export function LoginForm({ callbackUrl = "/" }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const fieldErrors = state && !state.success ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      {state && !state.success && !fieldErrors && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@servetech.global"
          className="glass-inset h-10 rounded-xl border-white/50"
        />
        {fieldErrors?.email?.[0] && (
          <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="glass-inset h-10 rounded-xl border-white/50"
        />
        {fieldErrors?.password?.[0] && (
          <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
        )}
      </div>
      <Button type="submit" className="h-10 w-full rounded-full font-semibold" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
