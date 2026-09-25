"use server";

import { revalidatePath } from "next/cache";

import {
  forbiddenActionResult,
  getSessionUser,
  unauthorizedActionResult,
} from "@/lib/auth/session";
import { zodFieldErrors } from "@/lib/actions/zod-form-errors";
import {
  createService,
  deleteService,
  setServiceActive,
  updateService,
} from "@/lib/services/services/service-service";
import {
  serviceActiveSchema,
  serviceFormSchema,
  serviceIdSchema,
} from "@/lib/validations/services/service-schema";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/common/action-result";

export async function upsertServiceAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }
  if (user.role !== "Admin") {
    return forbiddenActionResult();
  }

  const parsed = serviceFormSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid service data.", zodFieldErrors(parsed.error));
  }

  try {
    if (parsed.data.id) {
      await updateService(user, { ...parsed.data, id: parsed.data.id });
    } else {
      await createService(user, parsed.data);
    }
    revalidatePath("/services");
    revalidatePath("/activities");
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save service.";
    return actionFailure(message);
  }
}

export async function setServiceActiveAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }
  if (user.role !== "Admin") {
    return forbiddenActionResult();
  }

  const parsed = serviceActiveSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid service data.");
  }

  try {
    await setServiceActive(user, parsed.data.id, parsed.data.isActive);
    revalidatePath("/services");
    revalidatePath("/activities");
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update service.";
    return actionFailure(message);
  }
}

export async function deleteServiceAction(raw: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) {
    return unauthorizedActionResult();
  }
  if (user.role !== "Admin") {
    return forbiddenActionResult();
  }

  const parsed = serviceIdSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFailure("Invalid service id.");
  }

  try {
    await deleteService(user, parsed.data.id);
    revalidatePath("/services");
    revalidatePath("/activities");
    return actionSuccess(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete service.";
    return actionFailure(message);
  }
}
