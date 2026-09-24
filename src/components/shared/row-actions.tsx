"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type RowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  deleteLabel?: string;
};

export function RowActions({ onEdit, onDelete, deleteLabel = "Delete" }: RowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button type="button" variant="ghost" size="sm" className="h-8 rounded-full" onClick={onEdit}>
        <Pencil className="size-3.5" />
        Edit
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="size-3.5" />
        {deleteLabel}
      </Button>
    </div>
  );
}
