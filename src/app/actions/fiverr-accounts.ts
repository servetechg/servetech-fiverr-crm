"use server";

import { revalidatePath } from "next/cache";

import {
  forbiddenActionResult,
  getSessionUser,
  unauthorizedActionResult,
} from "@/lib/auth/session";
import { zodFieldErrors } from "@/lib/actions/zod-form-errors";
import {
  createFiverrAccount,
  deleteFiverrAccount,
  updateFiverrAccount,
} from "@/lib/services/fiverr-accounts/account-service";
import {
  fiverrAccountFormSchema,
  fiverrAccountIdSchema,
} from "@/lib/validations/fiverr-accounts/account-schema";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/common/action-result";

export async function upsertFiverrAccountAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }
  if (user.role !== "Admin") {
    return forbiddenActionResult();
  }

  const parsed = fiverrAccountFormSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid account data.", zodFieldErrors(parsed.error));
  }

  try {
    if (parsed.data.id) {
      await updateFiverrAccount(user, { ...parsed.data, id: parsed.data.id });
    } else {
      await createFiverrAccount(user, parsed.data);
    }
    revalidatePath("/fiverr-accounts");
    revalidatePath("/activities");
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save account.";
    return actionFailure(message);
  }
}

export async function deleteFiverrAccountAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }
  if (user.role !== "Admin") {
    return forbiddenActionResult();
  }

  const parsed = fiverrAccountIdSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid account id.");
  }

  try {
    await deleteFiverrAccount(user, parsed.data.id);
    revalidatePath("/fiverr-accounts");
    revalidatePath("/activities");
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete account.";
    return actionFailure(message);
  }
}
