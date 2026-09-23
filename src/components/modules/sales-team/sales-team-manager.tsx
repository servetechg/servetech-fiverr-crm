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
import { DataTableShell } from "@/components/shared/data-table-shell";
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
import { formatCurrency } from "@/lib/utils/format";
import {
  salesTeamFormSchema,
  type SalesTeamFormInput,
} from "@/lib/validations/sales-team/user-schema";
import type { SalesTeamListItem } from "@/types/sales-team/user-list-item";

type SalesTeamManagerProps = {
  items: SalesTeamListItem[];
};

const emptyForm: SalesTeamFormInput = {
  fullName: "",
  email: "",
  role: "Salesperson",
  monthlyTarget: 0,
  isActive: true,
  password: "",
  confirmPassword: "",
};

export function SalesTeamManager({ items }: SalesTeamManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SalesTeamListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SalesTeamFormInput>({
    resolver: zodResolver(salesTeamFormSchema),
    defaultValues: emptyForm,
  });

  const roleValue = form.watch("role");
  const isActiveValue = form.watch("isActive");

  const columns = useMemo<ColumnDef<SalesTeamListItem, unknown>[]>(
    () => [
      { accessorKey: "fullName", header: "Name" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="outline" className="rounded-full">
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "monthlyTarget",
        header: "Monthly target",
        cell: ({ row }) => formatCurrency(row.original.monthlyTarget),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <ActiveStatusBadge isActive={row.original.isActive} />,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers stable for table
    [],
  );

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
      password: "",
      confirmPassword: "",
    });
    setOpen(true);
  }

  function handleDelete(item: SalesTeamListItem): void {
    if (!window.confirm(`Delete team member "${item.fullName}"?`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteTeamMemberAction({ id: item.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Team member deleted.");
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
        description="Users, roles, and monthly targets."
        actions={
          <Button type="button" className="rounded-full" onClick={openCreate}>
            <Plus className="size-4" />
            Add member
          </Button>
        }
      />

      <DataTableShell columns={columns} data={items} emptyMessage="No team members yet." />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-surface max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit team member" : "Add team member"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" className="glass-inset rounded-xl" {...form.register("fullName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="glass-inset rounded-xl" {...form.register("email")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={roleValue}
                  onValueChange={(value) =>
                    form.setValue("role", value as SalesTeamFormInput["role"])
                  }
                >
                  <SelectTrigger className="glass-inset rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Salesperson">Salesperson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={isActiveValue ? "true" : "false"}
                  onValueChange={(value) => form.setValue("isActive", value === "true")}
                >
                  <SelectTrigger className="glass-inset rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyTarget">Monthly target (USD)</Label>
              <Input
                id="monthlyTarget"
                type="number"
                min={0}
                step="0.01"
                className="glass-inset rounded-xl"
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
                className="glass-inset rounded-xl"
                {...form.register("password")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="glass-inset rounded-xl"
                {...form.register("confirmPassword")}
              />
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
