"use server";

import { revalidatePath } from "next/cache";

import { zodFieldErrors } from "@/lib/actions/zod-form-errors";
import { getSessionUser, unauthorizedActionResult } from "@/lib/auth/session";
import { getLeadFormRecord } from "@/lib/queries/leads/get-lead-detail";
import { createLeadFull, deleteLead, updateLead } from "@/lib/services/leads/lead-service";
import { leadFormSchema, leadIdSchema } from "@/lib/validations/leads/lead-form-schema";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/common/action-result";
import type { LeadFormRecord } from "@/types/leads/lead-detail";

export async function getLeadFormRecordAction(
  raw: unknown,
): Promise<ActionResult<LeadFormRecord>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }

  const parsed = leadIdSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid lead id.");
  }

  const record = await getLeadFormRecord(user, parsed.data.id);
  if (!record) {
    return actionFailure("Lead not found.");
  }

  return actionSuccess(record);
}

export async function upsertLeadAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }

  const parsed = leadFormSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid lead data.", zodFieldErrors(parsed.error));
  }

  try {
    if (parsed.data.id) {
      await updateLead(user, { ...parsed.data, id: parsed.data.id });
      revalidatePath("/leads");
      revalidatePath(`/leads/${parsed.data.id}`);
    } else {
      await createLeadFull(user, parsed.data);
      revalidatePath("/leads");
    }
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save lead.";
    return actionFailure(message);
  }
}

export async function deleteLeadAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }

  const parsed = leadIdSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid lead id.");
  }

  try {
    await deleteLead(user, parsed.data.id);
    revalidatePath("/leads");
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete lead.";
    return actionFailure(message);
  }
}
