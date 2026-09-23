export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mesh-canvas relative flex min-h-svh flex-col items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
