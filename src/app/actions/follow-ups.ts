"use server";

import { revalidatePath } from "next/cache";

import { zodFieldErrors } from "@/lib/actions/zod-form-errors";
import { getSessionUser, unauthorizedActionResult } from "@/lib/auth/session";
import {
  createFollowUp,
  deleteFollowUp,
  moveFollowUpBoard,
  updateFollowUp,
} from "@/lib/services/follow-ups/follow-up-service";
import {
  followUpFormSchema,
  followUpIdSchema,
} from "@/lib/validations/follow-ups/follow-up-form-schema";
import { followUpMoveSchema } from "@/lib/validations/follow-ups/follow-up-move-schema";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/common/action-result";

export async function upsertFollowUpAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }

  const parsed = followUpFormSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid follow-up data.", zodFieldErrors(parsed.error));
  }

  try {
    if (parsed.data.id) {
      await updateFollowUp(user, { ...parsed.data, id: parsed.data.id });
    } else {
      await createFollowUp(user, parsed.data);
    }
    revalidatePath("/follow-ups");
    revalidatePath("/activities");
    revalidatePath(`/leads/${parsed.data.leadId}`);
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save follow-up.";
    return actionFailure(message);
  }
}

export async function moveFollowUpBucketAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }

  const parsed = followUpMoveSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid move.");
  }

  try {
    await moveFollowUpBoard(user, parsed.data);
    revalidatePath("/follow-ups");
    revalidatePath("/activities");
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not move follow-up.";
    return actionFailure(message);
  }
}

export async function deleteFollowUpAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }

  const parsed = followUpIdSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid follow-up id.");
  }

  try {
    await deleteFollowUp(user, parsed.data.id);
    revalidatePath("/follow-ups");
    revalidatePath("/activities");
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete follow-up.";
    return actionFailure(message);
  }
}
