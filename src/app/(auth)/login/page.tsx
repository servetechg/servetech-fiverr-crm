import Image from "next/image";

import { LoginForm } from "@/components/modules/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl?.startsWith("/") ? params.callbackUrl : "/";

  return (
    <div className="flex w-full flex-col items-center gap-5 sm:gap-6">
      <Image
        src={siteConfig.logoSrc}
        alt={siteConfig.logoAlt}
        width={220}
        height={72}
        priority
        className="h-12 w-auto max-w-[14rem] object-contain sm:h-[3.25rem]"
      />
      <Card className="glass-surface w-full overflow-hidden rounded-[1.75rem] border-white/60 shadow-[0_24px_60px_rgb(20_20_20_/0.1)] ring-1 ring-white/40 sm:rounded-[2rem]">
        <CardHeader className="space-y-1.5 p-6 pb-2 text-center sm:p-8 sm:pb-3">
          <CardTitle className="text-xl font-bold tracking-tight sm:text-2xl">
            {siteConfig.productName}
          </CardTitle>
          <CardDescription className="mx-auto max-w-[18rem] text-sm leading-relaxed text-foreground/65">
            Customer journey sales workspace — sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
          <LoginForm callbackUrl={callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
