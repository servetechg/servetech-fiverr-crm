"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { deleteActivityAction, upsertActivityAction } from "@/app/actions/activities";
import { ActivitiesFilters } from "@/components/modules/activities/activities-filters";
import { ActivityTypeBadge } from "@/components/modules/activities/activity-type-badge";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { ListPagination } from "@/components/shared/list-pagination";
import { RowActions } from "@/components/shared/row-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTIVITY_DIRECTION_LABELS,
  ACTIVITY_DIRECTION_OPTIONS,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_OPTIONS,
} from "@/lib/constants/activities";
import { isAdmin } from "@/lib/auth/rbac";
import {
  activityFormSchema,
  type ActivityFormInput,
} from "@/lib/validations/activities/activity-form-schema";
import { formatDateForInput, formatTimeForInput } from "@/lib/utils/datetime";
import { selectItemsById, selectItemsByIdFullName, selectItemsFromLabels } from "@/lib/utils/select-items";
import type { PaginatedResult } from "@/types/common/pagination";
import type { SessionUser } from "@/types/common/session-user";
import type { ActivityFormOptions, ActivityListItem } from "@/types/activities/activity-list-item";

type ActivitiesManagerProps = {
  user: SessionUser;
  data: PaginatedResult<ActivityListItem>;
  formOptions: ActivityFormOptions;
};

function defaultForm(user: SessionUser): ActivityFormInput {
  const now = new Date();
  return {
    leadId: 0,
    userId: user.id,
    activityDate: formatDateForInput(now),
    activityTime: formatTimeForInput(now),
    activityType: "SalesReply",
    direction: "Outgoing",
    messageCategory: "",
    actionTaken: "",
    responseTimeMinutes: undefined,
    upsellMentioned: false,
    notes: "",
  };
}

export function ActivitiesManager({ user, data, formOptions }: ActivitiesManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ActivityListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ActivityFormInput>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: defaultForm(user),
  });

  const leadIdValue = form.watch("leadId");
  const userIdValue = form.watch("userId");
  const upsellMentioned = form.watch("upsellMentioned");

  const leadSelectItems = useMemo(
    () => selectItemsById(formOptions.leads.map((lead) => ({ id: lead.id, label: lead.label }))),
    [formOptions.leads],
  );
  const salespersonSelectItems = useMemo(
    () => selectItemsByIdFullName(formOptions.salespeople),
    [formOptions.salespeople],
  );
  const activityTypeSelectItems = useMemo(
    () => selectItemsFromLabels(ACTIVITY_TYPE_LABELS),
    [],
  );
  const directionSelectItems = useMemo(
    () => selectItemsFromLabels(ACTIVITY_DIRECTION_LABELS),
    [],
  );

  const columns = useMemo<ColumnDef<ActivityListItem, unknown>[]>(
    () => [
      {
        id: "date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.original.activityTime), "yyyy-MM-dd"),
      },
      {
        id: "time",
        header: "Time",
        cell: ({ row }) => format(new Date(row.original.activityTime), "HH:mm"),
      },
      {
        id: "lead",
        header: "Lead",
        cell: ({ row }) => (
          <Link href={`/leads/${row.original.leadId}`} className="font-medium hover:underline">
            {row.original.leadCustomId}
          </Link>
        ),
      },
      {
        accessorKey: "activityType",
        header: "Type",
        cell: ({ row }) => <ActivityTypeBadge type={row.original.activityType} />,
      },
      {
        accessorKey: "direction",
        header: "Direction",
        cell: ({ row }) => ACTIVITY_DIRECTION_LABELS[row.original.direction],
      },
      { accessorKey: "repName", header: "Rep" },
      {
        accessorKey: "responseTimeMinutes",
        header: "Response (min)",
        cell: ({ row }) =>
          row.original.responseTimeMinutes === null ? "—" : row.original.responseTimeMinutes,
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-xs text-sm">{row.original.notes}</span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <RowActions
            onEdit={() => openEdit(row.original)}
            onDelete={() => setDeleteTarget(row.original)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable handlers
    [],
  );

  function openCreate(): void {
    setEditing(null);
    form.reset(defaultForm(user));
    setOpen(true);
  }

  function openEdit(item: ActivityListItem): void {
    setEditing(item);
    const at = new Date(item.activityTime);
    form.reset({
      id: item.id,
      leadId: item.leadId,
      userId: item.userId,
      activityDate: formatDateForInput(at),
      activityTime: formatTimeForInput(at),
      activityType: item.activityType,
      direction: item.direction,
      messageCategory: item.messageCategory ?? "",
      actionTaken: item.actionTaken ?? "",
      responseTimeMinutes: item.responseTimeMinutes ?? undefined,
      upsellMentioned: item.upsellMentioned,
      notes: item.notes,
    });
    setOpen(true);
  }

  function confirmDelete(): void {
    if (!deleteTarget) {
      return;
    }
    startTransition(async () => {
      const result = await deleteActivityAction({ id: deleteTarget.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Activity deleted.");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function onSubmit(values: ActivityFormInput): void {
    if (values.leadId <= 0) {
      form.setError("leadId", { message: "Select a lead" });
      return;
    }
    startTransition(async () => {
      const result = await upsertActivityAction(values);
      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            if (messages?.[0]) {
              form.setError(field as keyof ActivityFormInput, { message: messages[0] });
            }
          }
        }
        return;
      }
      toast.success(editing ? "Activity updated." : "Activity logged.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activities"
        description="Message history across every lead, with response-time tracking."
        actions={
          <Button type="button" className="rounded-full" onClick={openCreate}>
            <Plus className="size-4" />
            Add Activity
          </Button>
        }
      />

      <div className="space-y-3">
        <ActivitiesFilters user={user} formOptions={formOptions} />
        <p className="text-sm text-muted-foreground">{data.total} records</p>
      </div>

      <DataTableShell columns={columns} data={data.items} emptyMessage="No activities match your filters." />
      <ListPagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        entitySingular="record"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Activity" : "Add Activity"}</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2 sm:col-span-2">
              <Label>Lead</Label>
              <Select
                items={leadSelectItems}
                value={leadIdValue > 0 ? String(leadIdValue) : null}
                onValueChange={(value) => {
                  if (value) form.setValue("leadId", Number.parseInt(value, 10));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {formOptions.leads.map((lead) => (
                    <SelectItem key={lead.id} value={String(lead.id)}>
                      {lead.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityDate">Date</Label>
              <Input id="activityDate" type="date" {...form.register("activityDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityTime">Time</Label>
              <Input id="activityTime" type="time" {...form.register("activityTime")} />
            </div>
            <div className="space-y-2">
              <Label>Activity type</Label>
              <Select
                items={activityTypeSelectItems}
                value={form.watch("activityType")}
                onValueChange={(value) =>
                  form.setValue("activityType", value as ActivityFormInput["activityType"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ACTIVITY_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                items={directionSelectItems}
                value={form.watch("direction")}
                onValueChange={(value) =>
                  form.setValue("direction", value as ActivityFormInput["direction"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_DIRECTION_OPTIONS.map((direction) => (
                    <SelectItem key={direction} value={direction}>
                      {ACTIVITY_DIRECTION_LABELS[direction]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Salesperson</Label>
              <Select
                items={salespersonSelectItems}
                value={String(userIdValue)}
                onValueChange={(value) => {
                  if (value) form.setValue("userId", Number.parseInt(value, 10));
                }}
                disabled={!isAdmin(user)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formOptions.salespeople.map((rep) => (
                    <SelectItem key={rep.id} value={String(rep.id)}>
                      {rep.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responseTimeMinutes">Response time (minutes)</Label>
              <Input
                id="responseTimeMinutes"
                type="number"
                min={0}
                {...form.register("responseTimeMinutes", {
                  setValueAs: (value) =>
                    value === "" || value === undefined ? undefined : Number(value),
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="messageCategory">Message category</Label>
              <Input id="messageCategory" {...form.register("messageCategory")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actionTaken">Action taken</Label>
              <Input id="actionTaken" {...form.register("actionTaken")} />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                className="size-4 rounded border-input accent-[#C3F53C]"
                checked={upsellMentioned}
                onChange={(event) => form.setValue("upsellMentioned", event.target.checked)}
              />
              Upsell mentioned
            </label>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={4} {...form.register("notes")} />
            </div>
            <DialogFooter className="gap-2 sm:col-span-2 sm:justify-end">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDeleteTarget(null);
          }
        }}
        title="Delete activity?"
        description={
          deleteTarget
            ? "This activity log entry will be permanently removed."
            : ""
        }
        confirmLabel="Delete activity"
        destructive
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
