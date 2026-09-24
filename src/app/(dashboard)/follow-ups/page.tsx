import { Suspense } from "react";
import { redirect } from "next/navigation";

import { FollowUpsManager } from "@/components/modules/follow-ups/follow-ups-manager";
import { getSessionUser } from "@/lib/auth/session";
import { getFollowUpFormOptions } from "@/lib/queries/follow-ups/get-follow-up-form-options";
import { listFollowUps } from "@/lib/queries/follow-ups/list-follow-ups";

export default async function FollowUpsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const [items, formOptions] = await Promise.all([
    listFollowUps(user),
    getFollowUpFormOptions(user),
  ]);

  return (
    <Suspense>
      <FollowUpsManager user={user} items={items} formOptions={formOptions} />
    </Suspense>
  );
}
