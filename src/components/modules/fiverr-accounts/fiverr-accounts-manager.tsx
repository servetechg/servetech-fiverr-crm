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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fiverrAccountFormSchema,
  type FiverrAccountFormInput,
} from "@/lib/validations/fiverr-accounts/account-schema";
import type { FiverrAccountListItem } from "@/types/fiverr-accounts/account-list-item";

type FiverrAccountsManagerProps = {
  items: FiverrAccountListItem[];
};

const emptyForm: FiverrAccountFormInput = {
  accountName: "",
  profileUrl: "",
  isActive: true,
};

export function FiverrAccountsManager({ items }: FiverrAccountsManagerProps) {
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
        accessorKey: "profileUrl",
        header: "Profile URL",
        cell: ({ row }) =>
          row.original.profileUrl ? (
            <a
              href={row.original.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-foreground underline-offset-2 hover:underline"
            >
              Link
            </a>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <ActiveStatusBadge isActive={row.original.isActive} />,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers stable for table
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
      profileUrl: item.profileUrl ?? "",
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
        description="Manage seller profiles monitored by the team."
        actions={
          <Button type="button" className="rounded-full" onClick={openCreate}>
            <Plus className="size-4" />
            Add account
          </Button>
        }
      />

      <DataTableShell columns={columns} data={items} emptyMessage="No Fiverr accounts yet." />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit account" : "Add account"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="accountName">Account name</Label>
              <Input
                id="accountName"
                {...form.register("accountName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileUrl">Profile URL</Label>
              <Input
                id="profileUrl"
                placeholder="https://www.fiverr.com/..."
                {...form.register("profileUrl")}
              />
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
        onOpenChange={(open) => {
          if (!open) {
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
