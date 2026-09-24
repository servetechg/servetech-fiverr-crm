"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FollowUpStatus } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  deleteFollowUpAction,
  moveFollowUpBucketAction,
  upsertFollowUpAction,
} from "@/app/actions/follow-ups";
import { PageHeader } from "@/components/layout/page-header";
import { FollowUpCardContent } from "@/components/modules/follow-ups/follow-up-card-content";
import { FollowUpsStatusFilter } from "@/components/modules/follow-ups/follow-ups-status-filter";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
  FOLLOW_UP_STATUS_LABELS,
  FOLLOW_UP_STATUS_OPTIONS,
} from "@/lib/constants/follow-ups";
import { isAdmin } from "@/lib/auth/rbac";
import {
  canMoveFollowUpToBucket,
  getFollowUpBucket,
  getFollowUpUpdatesForBucket,
  type FollowUpBucket,
} from "@/lib/utils/follow-up-bucket";
import { formatDateForInput } from "@/lib/utils/datetime";
import {
  selectItemsById,
  selectItemsByIdFullName,
  selectItemsFromLabels,
} from "@/lib/utils/select-items";
import {
  followUpFormSchema,
  type FollowUpFormInput,
} from "@/lib/validations/follow-ups/follow-up-form-schema";
import type { SessionUser } from "@/types/common/session-user";
import type { FollowUpFormOptions, FollowUpListItem } from "@/types/follow-ups/follow-up-list-item";
import { cn } from "cn";

type PointerDragState = {
  item: FollowUpListItem;
  fromBucket: FollowUpBucket;
  pointerId: number;
  offsetX: number;
  offsetY: number;
  width: number;
};

type FollowUpsManagerProps = {
  user: SessionUser;
  items: FollowUpListItem[];
  formOptions: FollowUpFormOptions;
};

const COLUMN_META: { id: FollowUpBucket; title: string; tone?: string }[] = [
  { id: "overdue", title: "Overdue", tone: "border-red-200/80 bg-red-50/40" },
  { id: "today", title: "Due Today" },
  { id: "upcoming", title: "Upcoming" },
  { id: "completed", title: "Completed", tone: "border-emerald-200/60" },
];

function defaultForm(user: SessionUser): FollowUpFormInput {
  return {
    leadId: 0,
    salespersonId: user.id,
    scheduledDate: formatDateForInput(new Date()),
    description: "",
    status: "Pending",
    lastContactDate: "",
    notes: "",
  };
}

function FollowUpCard({
  item,
  bucket,
  isDragging,
  onClick,
  onPointerDown,
}: {
  item: FollowUpListItem;
  bucket: FollowUpBucket;
  isDragging: boolean;
  onClick: () => void;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={cn(
        "touch-none w-full cursor-grab rounded-xl border border-white/50 bg-white p-3 text-left shadow-sm transition-[box-shadow,transform,background-color,border-color] duration-200 hover:bg-white hover:shadow-md active:cursor-grabbing",
        bucket === "overdue" && "border-red-200/80 bg-red-50/90",
        bucket === "completed" && "border-l-4 border-l-emerald-400",
        isDragging && "border-dashed border-muted-foreground/35 bg-muted/25 shadow-none ring-2 ring-[#C3F53C]/30",
      )}
    >
      <FollowUpCardContent item={item} />
    </button>
  );
}

function resolveDropColumn(clientX: number, clientY: number): FollowUpBucket | null {
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const node of stack) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    const column = node.closest("[data-follow-up-column], [data-follow-up-dropzone]");
    if (column instanceof HTMLElement && column.dataset.followUpColumn) {
      return column.dataset.followUpColumn as FollowUpBucket;
    }
  }
  return null;
}

export function FollowUpsManager({ user, items, formOptions }: FollowUpsManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FollowUpListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FollowUpListItem | null>(null);
  const [pointerDrag, setPointerDrag] = useState<PointerDragState | null>(null);
  const [dragActivated, setDragActivated] = useState(false);
  const [dragPointer, setDragPointer] = useState<{ x: number; y: number } | null>(null);
  const [dragOverBucket, setDragOverBucket] = useState<FollowUpBucket | null>(null);
  const [boardItems, setBoardItems] = useState<FollowUpListItem[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const pointerMovedRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragOverBucketRef = useRef<FollowUpBucket | null>(null);
  const dragActivatedRef = useRef(false);

  useEffect(() => {
    dragOverBucketRef.current = dragOverBucket;
  }, [dragOverBucket]);

  useEffect(() => {
    dragActivatedRef.current = dragActivated;
  }, [dragActivated]);

  const form = useForm<FollowUpFormInput>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: defaultForm(user),
  });

  const leadIdValue = form.watch("leadId");
  const salespersonIdValue = form.watch("salespersonId");

  const leadSelectItems = useMemo(
    () => selectItemsById(formOptions.leads.map((lead) => ({ id: lead.id, label: lead.label }))),
    [formOptions.leads],
  );
  const salespersonSelectItems = useMemo(
    () => selectItemsByIdFullName(formOptions.salespeople),
    [formOptions.salespeople],
  );
  const statusSelectItems = useMemo(
    () => selectItemsFromLabels(FOLLOW_UP_STATUS_LABELS),
    [],
  );

  const statusFilter = searchParams.get("status");

  const sourceItems = boardItems ?? items;

  const filteredItems = useMemo(() => {
    if (!statusFilter || statusFilter === "all") {
      return sourceItems;
    }
    return sourceItems.filter((item) => item.status === (statusFilter as FollowUpStatus));
  }, [sourceItems, statusFilter]);

  useEffect(() => {
    setBoardItems(null);
  }, [items]);

  const grouped = useMemo(() => {
    const buckets: Record<FollowUpBucket, FollowUpListItem[]> = {
      overdue: [],
      today: [],
      upcoming: [],
      completed: [],
    };
    for (const item of filteredItems) {
      buckets[getFollowUpBucket(item)].push(item);
    }
    return buckets;
  }, [filteredItems]);

  const commitMove = useCallback(
    (item: FollowUpListItem, targetBucket: FollowUpBucket) => {
      const updates = getFollowUpUpdatesForBucket(item, targetBucket, new Date());
      const optimisticItem: FollowUpListItem = {
        ...item,
        status: updates.status,
        scheduledDate: updates.scheduledDate,
      };

      setBoardItems((current) => {
        const base = current ?? items;
        return base.map((entry) => (entry.id === item.id ? optimisticItem : entry));
      });

      startTransition(async () => {
        const result = await moveFollowUpBucketAction({
          id: item.id,
          targetBucket,
          status: updates.status,
          scheduledDate: updates.scheduledDate,
        });
        if (!result.success) {
          setBoardItems(null);
          toast.error(result.error);
          return;
        }
        router.refresh();
      });
    },
    [items, router, startTransition],
  );

  useEffect(() => {
    if (!pointerDrag) {
      return;
    }

    const { pointerId, item } = pointerDrag;

    function updateDragPosition(clientX: number, clientY: number): void {
      const start = dragStartRef.current;
      if (start && Math.hypot(clientX - start.x, clientY - start.y) > 4) {
        pointerMovedRef.current = true;
        dragActivatedRef.current = true;
        setDragActivated(true);
      }

      if (!dragActivatedRef.current) {
        return;
      }

      setDragPointer({ x: clientX, y: clientY });
      const column = resolveDropColumn(clientX, clientY);
      if (column && canMoveFollowUpToBucket(item, column)) {
        setDragOverBucket(column);
      } else {
        setDragOverBucket(null);
      }
    }

    function finishDrag(clientX: number, clientY: number): void {
      const wasActive = dragActivatedRef.current;
      const targetBucket =
        resolveDropColumn(clientX, clientY) ?? dragOverBucketRef.current;

      setPointerDrag(null);
      setDragActivated(false);
      dragActivatedRef.current = false;
      setDragPointer(null);
      setDragOverBucket(null);
      dragOverBucketRef.current = null;
      dragStartRef.current = null;

      if (wasActive && targetBucket && canMoveFollowUpToBucket(item, targetBucket)) {
        commitMove(item, targetBucket);
      }
    }

    function onWindowPointerMove(event: PointerEvent): void {
      if (event.pointerId !== pointerId) {
        return;
      }
      updateDragPosition(event.clientX, event.clientY);
    }

    function onWindowPointerEnd(event: PointerEvent): void {
      if (event.pointerId !== pointerId) {
        return;
      }
      const wasActive = dragActivatedRef.current;
      finishDrag(event.clientX, event.clientY);
      if (wasActive) {
        pointerMovedRef.current = true;
      }
    }

    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerEnd);
    window.addEventListener("pointercancel", onWindowPointerEnd);

    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerEnd);
      window.removeEventListener("pointercancel", onWindowPointerEnd);
    };
  }, [pointerDrag, commitMove]);

  function openCreate(): void {
    setEditing(null);
    form.reset(defaultForm(user));
    setOpen(true);
  }

  function openEdit(item: FollowUpListItem): void {
    setEditing(item);
    form.reset({
      id: item.id,
      leadId: item.leadId,
      salespersonId: item.salespersonId,
      scheduledDate: item.scheduledDate,
      description: item.description,
      status: item.status,
      lastContactDate: item.lastContactDate ?? "",
      notes: item.notes ?? "",
    });
    setOpen(true);
  }

  function onLeadChange(leadId: number): void {
    form.setValue("leadId", leadId);
    const lead = formOptions.leads.find((entry) => entry.id === leadId);
    if (lead && !isAdmin(user)) {
      form.setValue("salespersonId", lead.salespersonId);
    }
  }

  function confirmDelete(): void {
    if (!deleteTarget) {
      return;
    }
    startTransition(async () => {
      const result = await deleteFollowUpAction({ id: deleteTarget.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Follow-up deleted.");
      setDeleteTarget(null);
      setOpen(false);
      router.refresh();
    });
  }

  function handleCardPointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    item: FollowUpListItem,
    bucket: FollowUpBucket,
  ): void {
    if (event.button !== 0) {
      return;
    }
    pointerMovedRef.current = false;
    setDragActivated(false);
    dragActivatedRef.current = false;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    const rect = event.currentTarget.getBoundingClientRect();
    setPointerDrag({
      item,
      fromBucket: bucket,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
    });
    setDragPointer({ x: event.clientX, y: event.clientY });
  }

  function handleCardClick(item: FollowUpListItem): void {
    if (pointerMovedRef.current) {
      pointerMovedRef.current = false;
      return;
    }
    openEdit(item);
  }

  function onSubmit(values: FollowUpFormInput): void {
    if (values.leadId <= 0) {
      form.setError("leadId", { message: "Select a lead" });
      return;
    }
    startTransition(async () => {
      const result = await upsertFollowUpAction(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Follow-up updated." : "Follow-up created.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Stay on top of every promised call-back — drag cards between columns to reschedule or mark done."
        actions={
          <Button type="button" className="rounded-full" onClick={openCreate}>
            <Plus className="size-4" />
            Add Follow-up
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FollowUpsStatusFilter />
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} follow-up{filteredItems.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {COLUMN_META.map((column) => {
          const columnItems = grouped[column.id];
          const isDropTarget = dragOverBucket === column.id;
          return (
            <section
              key={column.id}
              data-follow-up-column={column.id}
              className={cn(
                "flex min-h-72 flex-col rounded-2xl border border-white/50 bg-white/35 p-3 backdrop-blur-sm transition-[box-shadow,background-color] duration-200",
                column.tone,
                isDropTarget && "bg-white/55 ring-2 ring-[#C3F53C]/80 ring-offset-2",
              )}
            >
              <header className="mb-3 flex items-center justify-between gap-2 px-1">
                <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  {column.title}
                </h2>
                <span className="text-xs text-muted-foreground">{columnItems.length}</span>
              </header>
              <div
                data-follow-up-dropzone=""
                data-follow-up-column={column.id}
                className={cn(
                  "flex min-h-56 flex-1 flex-col gap-2 overflow-y-auto rounded-xl transition-colors duration-200",
                  isDropTarget && "bg-[#C3F53C]/5",
                )}
              >
                {columnItems.length === 0 ? (
                  <p
                    className={cn(
                      "px-1 py-6 text-center text-sm text-muted-foreground transition-opacity duration-200",
                      isDropTarget && "opacity-70",
                    )}
                  >
                    {isDropTarget ? "Release to drop" : "Nothing here"}
                  </p>
                ) : (
                  columnItems.map((item) => (
                    <FollowUpCard
                      key={item.id}
                      item={item}
                      bucket={column.id}
                      isDragging={dragActivated && pointerDrag?.item.id === item.id}
                      onClick={() => handleCardClick(item)}
                      onPointerDown={(event) => handleCardPointerDown(event, item, column.id)}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      {pointerDrag && dragPointer && dragActivated ? (
        <div
          className="pointer-events-none fixed z-50 rounded-xl border border-white/90 bg-white p-3 text-left shadow-xl ring-1 ring-black/5"
          style={{
            width: pointerDrag.width,
            left: dragPointer.x - pointerDrag.offsetX,
            top: dragPointer.y - pointerDrag.offsetY,
            transform: "scale(1.02)",
          }}
        >
          <FollowUpCardContent item={pointerDrag.item} />
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Follow-up" : "Add Follow-up"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label>Lead</Label>
              <Select
                items={leadSelectItems}
                value={leadIdValue > 0 ? String(leadIdValue) : null}
                onValueChange={(value) => {
                  if (value) onLeadChange(Number.parseInt(value, 10));
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
              <Label>Salesperson</Label>
              <Select
                items={salespersonSelectItems}
                value={String(salespersonIdValue)}
                onValueChange={(value) => {
                  if (value) form.setValue("salespersonId", Number.parseInt(value, 10));
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
              <Label htmlFor="scheduledDate">Follow-up date</Label>
              <Input id="scheduledDate" type="date" {...form.register("scheduledDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Follow-up reason</Label>
              <Input id="description" {...form.register("description")} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                items={statusSelectItems}
                value={form.watch("status")}
                onValueChange={(value) =>
                  form.setValue("status", value as FollowUpFormInput["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOW_UP_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {FOLLOW_UP_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastContactDate">Last contact</Label>
              <Input id="lastContactDate" type="date" {...form.register("lastContactDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...form.register("notes")} />
            </div>
            <DialogFooter className="flex-wrap gap-2 sm:justify-between">
              {editing ? (
                <Button
                  type="button"
                  variant="destructive"
                  className="rounded-full"
                  disabled={isPending}
                  onClick={() => setDeleteTarget(editing)}
                >
                  Delete
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="ghost" className="rounded-full" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full" disabled={isPending}>
                  {isPending ? "Saving…" : "Save"}
                </Button>
              </div>
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
        title="Delete follow-up?"
        description="This follow-up will be permanently removed."
        confirmLabel="Delete follow-up"
        destructive
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
