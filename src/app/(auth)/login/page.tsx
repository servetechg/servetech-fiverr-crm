import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/modules/auth/login-form";
import { siteConfig } from "@/config/site";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl?.startsWith("/") ? params.callbackUrl : "/";

  return (
    <Card className="glass-surface rounded-[1.75rem] border-white/60 shadow-[0_24px_60px_rgb(20_20_20_/0.1)] sm:rounded-[2rem]">
      <CardHeader className="space-y-4 p-6 pb-4 text-center sm:p-8">
        <Image
          src={siteConfig.logoSrc}
          alt={siteConfig.logoAlt}
          width={200}
          height={64}
          priority
          className="mx-auto h-12 w-auto max-w-[13rem] object-contain sm:h-14"
        />
        <CardTitle className="text-xl font-bold tracking-tight sm:text-2xl">
          {siteConfig.productName}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Customer journey sales workspace — sign in to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
        <LoginForm callbackUrl={callbackUrl} />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo: admin@servetech.global / Password123!
        </p>
      </CardContent>
    </Card>
  );
}
