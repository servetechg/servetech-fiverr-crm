import { ThemeToggleDock } from "@/components/layout/theme-toggle";
import { LoginPageBackground } from "@/components/modules/auth/login-page-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="login-page-shell relative flex min-h-svh flex-col items-center justify-center p-4 sm:p-6">
      <LoginPageBackground />
      <ThemeToggleDock />
      <div className="relative z-10 w-full max-w-[26rem]">{children}</div>
    </div>
  );
}
