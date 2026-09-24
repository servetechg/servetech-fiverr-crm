"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  deleteFiverrAccountAction,
  upsertFiverrAccountAction,
} from "@/app/actions/fiverr-accounts";
import { PageHeader } from "@/components/layout/page-header";
import { ActiveStatusBadge } from "@/components/shared/active-status-badge";
import { AdminActiveStatusFilter } from "@/components/shared/admin-active-status-filter";
import { AdminSearchInput } from "@/components/shared/admin-search-input";
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
  fiverrAccountFormSchema,
  type FiverrAccountFormInput,
} from "@/lib/validations/fiverr-accounts/account-schema";
import type { PaginatedResult } from "@/types/common/pagination";
import type { FiverrAccountListItem } from "@/types/fiverr-accounts/account-list-item";

type FiverrAccountsManagerProps = {
  data: PaginatedResult<FiverrAccountListItem>;
};

const emptyForm: FiverrAccountFormInput = {
  accountName: "",
  accountOwner: "",
  assignedTeam: "",
  notes: "",
  isActive: true,
};

export function FiverrAccountsManager({ data }: FiverrAccountsManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FiverrAccountListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FiverrAccountListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FiverrAccountFormInput>({
    resolver: zodResolver(fiverrAccountFormSchema),
    defaultValues: emptyForm,
  });

  const isActiveValue = form.watch("isActive");

  const columns = useMemo<ColumnDef<FiverrAccountListItem, unknown>[]>(
    () => [
      { accessorKey: "accountName", header: "Account" },
      {
        accessorKey: "accountOwner",
        header: "Owner",
        cell: ({ row }) => row.original.accountOwner ?? "—",
      },
      {
        accessorKey: "assignedTeam",
        header: "Team",
        cell: ({ row }) => row.original.assignedTeam ?? "—",
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <ActiveStatusBadge isActive={row.original.isActive} />,
      },
      {
        accessorKey: "leadCount",
        header: "Leads",
        cell: ({ row }) => row.original.leadCount,
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <RowActions
            onEdit={() => openEdit(row.original)}
            onDelete={() => setDeleteTarget(row.original)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable row handlers
    [],
  );

  function openCreate(): void {
    setEditing(null);
    form.reset(emptyForm);
    setOpen(true);
  }

  function openEdit(item: FiverrAccountListItem): void {
    setEditing(item);
    form.reset({
      id: item.id,
      accountName: item.accountName,
      accountOwner: item.accountOwner ?? "",
      assignedTeam: item.assignedTeam ?? "",
      notes: item.notes ?? "",
      isActive: item.isActive,
    });
    setOpen(true);
  }

  function confirmDelete(): void {
    if (!deleteTarget) {
      return;
    }
    startTransition(async () => {
      const result = await deleteFiverrAccountAction({ id: deleteTarget.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Account deleted.");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function onSubmit(values: FiverrAccountFormInput): void {
    startTransition(async () => {
      const result = await upsertFiverrAccountAction(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Account updated." : "Account created.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiverr Accounts"
        description="Every Fiverr seller account that receives leads."
        actions={
          <Button type="button" className="rounded-full" onClick={openCreate}>
            <Plus className="size-4" />
            Add Account
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <AdminSearchInput placeholder="Search account, owner, or team…" />
        <AdminActiveStatusFilter />
        <p className="text-sm text-muted-foreground sm:ml-auto">{data.total} records</p>
      </div>

      <DataTableShell columns={columns} data={data.items} emptyMessage="No Fiverr accounts match your filters." />
      <ListPagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        entitySingular="account"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Fiverr Account" : "Add Fiverr Account"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="accountName">Account name</Label>
              <Input id="accountName" {...form.register("accountName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountOwner">Account owner</Label>
              <Input id="accountOwner" {...form.register("accountOwner")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTeam">Assigned team</Label>
              <Input id="assignedTeam" {...form.register("assignedTeam")} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={isActiveValue ? "true" : "false"}
                onValueChange={(value) => form.setValue("isActive", value === "true")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...form.register("notes")} />
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDeleteTarget(null);
          }
        }}
        title="Delete Fiverr account?"
        description={
          deleteTarget
            ? `"${deleteTarget.accountName}" will be permanently removed. Linked leads or orders may block deletion.`
            : ""
        }
        confirmLabel="Delete account"
        destructive
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
