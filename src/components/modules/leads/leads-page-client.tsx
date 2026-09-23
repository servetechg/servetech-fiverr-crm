"use client";

import type { ReactNode } from "react";
import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  deleteLeadAction,
  getLeadFormRecordAction,
} from "@/app/actions/leads";
import { LeadFormDialog } from "@/components/modules/leads/lead-form-dialog";
import { LeadsActionsProvider } from "@/components/modules/leads/leads-actions-context";
import { LeadsFilters } from "@/components/modules/leads/leads-filters";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/types/common/session-user";
import type { LeadFormRecord } from "@/types/leads/lead-detail";
import type { LeadFilterOptions } from "@/types/leads/lead-filter-options";
import type { LeadListItem } from "@/types/leads/lead-list-item";

type DeleteTarget = {
  id: number;
  leadCustomId: string;
  clientLabel: string;
};

type LeadsPageClientProps = {
  user: SessionUser;
  filterOptions: LeadFilterOptions;
  children: ReactNode;
};

export function LeadsPageClient({ user, filterOptions, children }: LeadsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LeadFormRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isPending, startTransition] = useTransition();

  const openCreate = useCallback((): void => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((id: number): void => {
    startTransition(async () => {
      const result = await getLeadFormRecordAction({ id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setEditing(result.data);
      setFormOpen(true);
    });
  }, []);

  const requestDelete = useCallback((row: LeadListItem): void => {
    setDeleteTarget({
      id: row.id,
      leadCustomId: row.leadCustomId,
      clientLabel: row.clientName ?? row.fiverrUsername,
    });
  }, []);

  const confirmDelete = (): void => {
    if (!deleteTarget) {
      return;
    }
    startTransition(async () => {
      const result = await deleteLeadAction({ id: deleteTarget.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Lead deleted.");
      setDeleteTarget(null);
      router.refresh();
    });
  };

  const exportCsv = (): void => {
    startTransition(async () => {
      const query = searchParams.toString();
      const response = await fetch(`/api/export-csv/leads${query ? `?${query}` : ""}`);
      if (!response.ok) {
        toast.error("Export failed.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "leads-export.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    });
  };

  const onImportFile = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/import-csv/leads", { method: "POST", body: formData });
    const body: unknown = await response.json();
    if (!response.ok) {
      const message =
        typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
          ? body.error
          : "Import failed.";
      toast.error(message);
      return;
    }
    const imported =
      typeof body === "object" && body !== null && "imported" in body && typeof body.imported === "number"
        ? body.imported
        : 0;
    toast.success(`Imported ${imported} lead${imported === 1 ? "" : "s"}.`);
    router.refresh();
  };

  return (
    <LeadsActionsProvider value={{ onEdit: openEdit, onDelete: requestDelete }}>
      <div className="space-y-6">
        <PageHeader
          title="Leads"
          description="Track Fiverr conversations from first message through order."
          actions={
            <>
              <Button type="button" variant="outline" className="rounded-full" onClick={exportCsv}>
                <Download className="size-4" />
                Export CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                Import CSV
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) {
                    void onImportFile(file);
                  }
                }}
              />
              <Button type="button" className="rounded-full" onClick={openCreate}>
                <Plus className="size-4" />
                Add lead
              </Button>
            </>
          }
        />

        <LeadsFilters filterOptions={filterOptions} user={user} />

        {children}

        <LeadFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          filterOptions={filterOptions}
          user={user}
          editing={editing}
        />

        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
          title="Delete lead?"
          description={
            deleteTarget
              ? `${deleteTarget.leadCustomId} (${deleteTarget.clientLabel}) will be permanently removed. Linked orders may block deletion.`
              : ""
          }
          confirmLabel="Delete lead"
          destructive
          loading={isPending}
          onConfirm={confirmDelete}
        />
      </div>
    </LeadsActionsProvider>
  );
}
