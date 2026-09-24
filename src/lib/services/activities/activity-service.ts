import type { ActivityFormInput } from "@/lib/validations/activities/activity-form-schema";
import { combineDateAndTime } from "@/lib/utils/datetime";
import { prisma } from "@/lib/db/prisma";
import {
  assertCanAccessActivity,
  assertCanAccessLead,
} from "@/lib/services/activities/activity-access";
import type { SessionUser } from "@/types/common/session-user";

function mapActivityData(input: ActivityFormInput) {
  return {
    leadId: input.leadId,
    userId: input.userId,
    activityType: input.activityType,
    direction: input.direction,
    messageCategory: input.messageCategory?.trim() || null,
    actionTaken: input.actionTaken?.trim() || null,
    responseTimeMinutes: input.responseTimeMinutes ?? null,
    upsellMentioned: input.upsellMentioned,
    notes: input.notes.trim(),
    activityTime: combineDateAndTime(input.activityDate, input.activityTime),
  };
}

export async function createActivity(
  user: SessionUser,
  input: ActivityFormInput,
): Promise<{ id: number }> {
  await assertCanAccessLead(user, input.leadId);
  if (user.role !== "Admin" && input.userId !== user.id) {
    throw new Error("You can only log activities as yourself.");
  }

  const created = await prisma.activity.create({
    data: mapActivityData(input),
  });
  return { id: created.id };
}

export async function updateActivity(
  user: SessionUser,
  input: ActivityFormInput & { id: number },
): Promise<void> {
  await assertCanAccessActivity(user, input.id);
  await assertCanAccessLead(user, input.leadId);
  if (user.role !== "Admin" && input.userId !== user.id) {
    throw new Error("You can only assign activities to yourself.");
  }

  await prisma.activity.update({
    where: { id: input.id },
    data: mapActivityData(input),
  });
}

export async function deleteActivity(user: SessionUser, id: number): Promise<void> {
  await assertCanAccessActivity(user, id);
  await prisma.activity.delete({ where: { id } });
}
