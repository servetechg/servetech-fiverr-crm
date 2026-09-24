"use server";

import { revalidatePath } from "next/cache";

import { zodFieldErrors } from "@/lib/actions/zod-form-errors";
import { getSessionUser, unauthorizedActionResult } from "@/lib/auth/session";
import {
  createActivity,
  deleteActivity,
  updateActivity,
} from "@/lib/services/activities/activity-service";
import {
  activityFormSchema,
  activityIdSchema,
} from "@/lib/validations/activities/activity-form-schema";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/common/action-result";

export async function upsertActivityAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }

  const parsed = activityFormSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid activity data.", zodFieldErrors(parsed.error));
  }

  try {
    if (parsed.data.id) {
      await updateActivity(user, { ...parsed.data, id: parsed.data.id });
    } else {
      await createActivity(user, parsed.data);
    }
    revalidatePath("/activities");
    revalidatePath(`/leads/${parsed.data.leadId}`);
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save activity.";
    return actionFailure(message);
  }
}

export async function deleteActivityAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }

  const parsed = activityIdSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid activity id.");
  }

  try {
    await deleteActivity(user, parsed.data.id);
    revalidatePath("/activities");
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete activity.";
    return actionFailure(message);
  }
}
