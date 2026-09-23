"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { deleteServiceAction, upsertServiceAction } from "@/app/actions/services";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableShell } from "@/components/shared/data-table-shell";
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
import { formatCurrency } from "@/lib/utils/format";
import {
  serviceFormSchema,
  type ServiceFormInput,
} from "@/lib/validations/services/service-schema";
import type { ServiceListItem } from "@/types/services/service-list-item";

type ServicesManagerProps = {
  items: ServiceListItem[];
};

const emptyForm: ServiceFormInput = {
  serviceName: "",
  category: "",
  defaultBasePrice: 0,
};

export function ServicesManager({ items }: ServicesManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: emptyForm,
  });

  const columns = useMemo<ColumnDef<ServiceListItem, unknown>[]>(
    () => [
      { accessorKey: "serviceName", header: "Service" },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "defaultBasePrice",
        header: "Base price",
        cell: ({ row }) => formatCurrency(row.original.defaultBasePrice),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <RowActions
            onEdit={() => openEdit(row.original)}
            onDelete={() => handleDelete(row.original)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- openEdit/handleDelete stable per mount
    [],
  );

  function openCreate(): void {
    setEditing(null);
    form.reset(emptyForm);
    setOpen(true);
  }

  function openEdit(item: ServiceListItem): void {
    setEditing(item);
    form.reset({
      id: item.id,
      serviceName: item.serviceName,
      category: item.category,
      defaultBasePrice: item.defaultBasePrice,
    });
    setOpen(true);
  }

  function handleDelete(item: ServiceListItem): void {
    if (!window.confirm(`Delete service "${item.serviceName}"?`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteServiceAction({ id: item.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Service deleted.");
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
      toast.success(editing ? "Service updated." : "Service created.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Service catalog for leads and orders."
        actions={
          <Button type="button" className="rounded-full" onClick={openCreate}>
            <Plus className="size-4" />
            Add service
          </Button>
        }
      />

      <DataTableShell columns={columns} data={items} emptyMessage="No services yet." />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-surface rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit service" : "Add service"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="serviceName">Service name</Label>
              <Input id="serviceName" className="glass-inset rounded-xl" {...form.register("serviceName")} />
              {form.formState.errors.serviceName?.message && (
                <p className="text-xs text-destructive">{form.formState.errors.serviceName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" className="glass-inset rounded-xl" {...form.register("category")} />
              {form.formState.errors.category?.message && (
                <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultBasePrice">Default base price (USD)</Label>
              <Input
                id="defaultBasePrice"
                type="number"
                min={0}
                step="0.01"
                className="glass-inset rounded-xl"
                {...form.register("defaultBasePrice", { valueAsNumber: true })}
              />
              {form.formState.errors.defaultBasePrice?.message && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.defaultBasePrice.message}
                </p>
              )}
            </div>
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
    </div>
  );
}
