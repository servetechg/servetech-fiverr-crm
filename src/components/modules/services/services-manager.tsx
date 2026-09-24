"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  deleteServiceAction,
  setServiceActiveAction,
  upsertServiceAction,
} from "@/app/actions/services";
import { PageHeader } from "@/components/layout/page-header";
import { ActiveStatusBadge } from "@/components/shared/active-status-badge";
import { AdminSearchInput } from "@/components/shared/admin-search-input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { ListPagination } from "@/components/shared/list-pagination";
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
  serviceFormSchema,
  type ServiceFormInput,
} from "@/lib/validations/services/service-schema";
import type { PaginatedResult } from "@/types/common/pagination";
import type { ServiceListItem } from "@/types/services/service-list-item";

type ServicesManagerProps = {
  data: PaginatedResult<ServiceListItem>;
};

const emptyForm: ServiceFormInput = {
  serviceName: "",
  isActive: true,
};

export function ServicesManager({ data }: ServicesManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: emptyForm,
  });

  const isActiveValue = form.watch("isActive");

  const columns = useMemo<ColumnDef<ServiceListItem, unknown>[]>(
    () => [
      { accessorKey: "serviceName", header: "Service" },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <ActiveStatusBadge isActive={row.original.isActive} />,
      },
      {
        accessorKey: "leadCount",
        header: "Leads using",
        cell: ({ row }) => row.original.leadCount,
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex flex-wrap justify-end gap-2">
            {row.original.isActive ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-full"
                disabled={isPending}
                onClick={() => toggleActive(row.original, false)}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-full"
                disabled={isPending}
                onClick={() => toggleActive(row.original, true)}
              >
                Activate
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 rounded-full"
              onClick={() => setDeleteTarget(row.original)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isPending toggles disable state
    [isPending],
  );

  function toggleActive(item: ServiceListItem, isActive: boolean): void {
    startTransition(async () => {
      const result = await setServiceActiveAction({ id: item.id, isActive });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isActive ? "Service activated." : "Service deactivated.");
      router.refresh();
    });
  }

  function openCreate(): void {
    form.reset(emptyForm);
    setOpen(true);
  }

  function confirmDelete(): void {
    if (!deleteTarget) {
      return;
    }
    startTransition(async () => {
      const result = await deleteServiceAction({ id: deleteTarget.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Service deleted.");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function onSubmit(values: ServiceFormInput): void {
    startTransition(async () => {
      const result = await upsertServiceAction(values);
      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            if (messages?.[0]) {
              form.setError(field as keyof ServiceFormInput, { message: messages[0] });
            }
          }
        }
        return;
      }
      toast.success("Service created.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Configurable list of services offered on Fiverr."
        actions={
          <Button type="button" className="rounded-full" onClick={openCreate}>
            <Plus className="size-4" />
            Add Service
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminSearchInput placeholder="Search services…" />
        <p className="text-sm text-muted-foreground sm:ml-auto">{data.total} records</p>
      </div>

      <DataTableShell columns={columns} data={data.items} emptyMessage="No services match your search." />
      <ListPagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        entitySingular="service"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Service</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="serviceName">Service name</Label>
              <Input id="serviceName" {...form.register("serviceName")} />
              {form.formState.errors.serviceName?.message && (
                <p className="text-xs text-destructive">{form.formState.errors.serviceName.message}</p>
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-input accent-[#C3F53C]"
                checked={isActiveValue}
                onChange={(event) => form.setValue("isActive", event.target.checked)}
              />
              Active
            </label>
            <DialogFooter className="gap-2 sm:gap-0">
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
        title="Delete service?"
        description={
          deleteTarget
            ? `"${deleteTarget.serviceName}" will be permanently removed. Leads or orders linked to this service may block deletion.`
            : ""
        }
        confirmLabel="Delete service"
        destructive
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
