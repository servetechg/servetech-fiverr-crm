"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { deleteTeamMemberAction, upsertTeamMemberAction } from "@/app/actions/sales-team";
import { PageHeader } from "@/components/layout/page-header";
import { ActiveStatusBadge } from "@/components/shared/active-status-badge";
import { AdminRoleFilter } from "@/components/shared/admin-role-filter";
import { AdminSearchInput } from "@/components/shared/admin-search-input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { ListPagination } from "@/components/shared/list-pagination";
import { RowActions } from "@/components/shared/row-actions";
import { Badge } from "@/components/ui/badge";
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
  ACTIVE_STATUS_SELECT_ITEMS,
  activeStatusSelectValue,
  parseActiveStatusSelectValue,
} from "@/lib/constants/active-status-select";
import { USER_ROLE_LABELS } from "@/lib/constants/user-roles";
import { formatCurrency } from "@/lib/utils/format";
import {
  salesTeamFormSchema,
  type SalesTeamFormInput,
} from "@/lib/validations/sales-team/user-schema";
import type { PaginatedResult } from "@/types/common/pagination";
import type { FiverrAccountOption, SalesTeamListItem } from "@/types/sales-team/user-list-item";

type SalesTeamManagerProps = {
  data: PaginatedResult<SalesTeamListItem>;
  fiverrAccountOptions: FiverrAccountOption[];
};

const emptyForm: SalesTeamFormInput = {
  fullName: "",
  email: "",
  role: "Salesperson",
  monthlyTarget: 0,
  isActive: true,
  fiverrAccountIds: [],
  notes: "",
  password: "",
  confirmPassword: "",
};

export function SalesTeamManager({ data, fiverrAccountOptions }: SalesTeamManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SalesTeamListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalesTeamListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SalesTeamFormInput>({
    resolver: zodResolver(salesTeamFormSchema),
    defaultValues: emptyForm,
  });

  const roleValue = form.watch("role");
  const isActiveValue = form.watch("isActive");
  const assignedIds = form.watch("fiverrAccountIds");

  const columns = useMemo<ColumnDef<SalesTeamListItem, unknown>[]>(
    () => [
      { accessorKey: "fullName", header: "Name" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="outline" className="rounded-full">
            {USER_ROLE_LABELS[row.original.role]}
          </Badge>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <ActiveStatusBadge isActive={row.original.isActive} />,
      },
      {
        accessorKey: "monthlyTarget",
        header: "Target",
        cell: ({ row }) => formatCurrency(row.original.monthlyTarget),
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

  function toggleAccountId(accountId: number): void {
    const current = form.getValues("fiverrAccountIds");
    if (current.includes(accountId)) {
      form.setValue(
        "fiverrAccountIds",
        current.filter((id) => id !== accountId),
        { shouldDirty: true },
      );
      return;
    }
    form.setValue("fiverrAccountIds", [...current, accountId], { shouldDirty: true });
  }

  function openCreate(): void {
    setEditing(null);
    form.reset(emptyForm);
    setOpen(true);
  }

  function openEdit(item: SalesTeamListItem): void {
    setEditing(item);
    form.reset({
      id: item.id,
      fullName: item.fullName,
      email: item.email,
      role: item.role,
      monthlyTarget: item.monthlyTarget,
      isActive: item.isActive,
      fiverrAccountIds: item.assignedFiverrAccountIds,
      notes: item.notes ?? "",
      password: "",
      confirmPassword: "",
    });
    setOpen(true);
  }

  function confirmDelete(): void {
    if (!deleteTarget) {
      return;
    }
    startTransition(async () => {
      const result = await deleteTeamMemberAction({ id: deleteTarget.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Team member deleted.");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function onSubmit(values: SalesTeamFormInput): void {
    startTransition(async () => {
      const payload = { ...values };
      if (editing && !payload.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }
      const result = await upsertTeamMemberAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Team member updated." : "Team member created.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Team"
        description="Everyone with access, their role, and monthly targets."
        actions={
          <Button type="button" className="rounded-full" onClick={openCreate}>
            <Plus className="size-4" />
            Add Team Member
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <AdminSearchInput placeholder="Search name or email…" />
        <AdminRoleFilter />
        <p className="text-sm text-muted-foreground sm:ml-auto">{data.total} records</p>
      </div>

      <DataTableShell columns={columns} data={data.items} emptyMessage="No team members match your filters." />
      <ListPagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        entitySingular="record"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Name</Label>
              <Input id="fullName" {...form.register("fullName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  items={{ Admin: USER_ROLE_LABELS.Admin, Salesperson: USER_ROLE_LABELS.Salesperson }}
                  value={roleValue}
                  onValueChange={(value) =>
                    form.setValue("role", value as SalesTeamFormInput["role"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Salesperson">Sales person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  items={ACTIVE_STATUS_SELECT_ITEMS}
                  value={activeStatusSelectValue(isActiveValue)}
                  onValueChange={(value) => {
                    if (value) form.setValue("isActive", parseActiveStatusSelectValue(value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned Fiverr accounts</Label>
              <div className="max-h-36 space-y-2 overflow-y-auto rounded-xl border border-[var(--field-border)] bg-[var(--field-bg)] p-3">
                {fiverrAccountOptions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No active Fiverr accounts yet.</p>
                ) : (
                  fiverrAccountOptions.map((account) => (
                    <label key={account.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input accent-[#C3F53C]"
                        checked={assignedIds.includes(account.id)}
                        onChange={() => toggleAccountId(account.id)}
                      />
                      {account.accountName}
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyTarget">Monthly target (USD)</Label>
              <Input
                id="monthlyTarget"
                type="number"
                min={0}
                step="0.01"
                {...form.register("monthlyTarget", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {editing ? "New password (optional)" : "Password"}
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...form.register("password")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...form.register("confirmPassword")}
              />
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
        title="Delete team member?"
        description={
          deleteTarget
            ? `${deleteTarget.fullName} (${deleteTarget.email}) will be permanently removed. Assigned leads may block deletion.`
            : ""
        }
        confirmLabel="Delete member"
        destructive
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
