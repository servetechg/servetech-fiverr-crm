"use server";

import { revalidatePath } from "next/cache";

import {
  forbiddenActionResult,
  getSessionUser,
  unauthorizedActionResult,
} from "@/lib/auth/session";
import { zodFieldErrors } from "@/lib/actions/zod-form-errors";
import {
  createTeamMember,
  deleteTeamMember,
  updateTeamMember,
} from "@/lib/services/sales-team/user-service";
import {
  salesTeamFormSchema,
  salesTeamIdSchema,
} from "@/lib/validations/sales-team/user-schema";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/common/action-result";

export async function upsertTeamMemberAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }
  if (user.role !== "Admin") {
    return forbiddenActionResult();
  }

  const parsed = salesTeamFormSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid team member data.", zodFieldErrors(parsed.error));
  }

  try {
    if (parsed.data.id) {
      await updateTeamMember(user, { ...parsed.data, id: parsed.data.id });
    } else {
      await createTeamMember(user, parsed.data);
    }
    revalidatePath("/sales-team");
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save team member.";
    return actionFailure(message);
  }
}

export async function deleteTeamMemberAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }
  if (user.role !== "Admin") {
    return forbiddenActionResult();
  }

  const parsed = salesTeamIdSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid user id.");
  }

  try {
    await deleteTeamMember(user, parsed.data.id);
    revalidatePath("/sales-team");
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete team member.";
    return actionFailure(message);
  }
}
