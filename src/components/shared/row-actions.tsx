"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";

type RowActionsProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  detailHref?: string;
  deleteLabel?: string;
  showEdit?: boolean;
  showDelete?: boolean;
};

const iconActionClass =
  "size-8 rounded-md text-muted-foreground hover:text-foreground";

export function RowActions({
  onEdit,
  onDelete,
  detailHref,
  deleteLabel = "Delete",
  showEdit = true,
  showDelete = true,
}: RowActionsProps) {
  const router = useRouter();
  const canEdit = showEdit && onEdit !== undefined;
  const canDelete = showDelete && onDelete !== undefined;
  const hasMenuItems = Boolean(detailHref) || canEdit || canDelete;

  return (
    <div className="flex items-center justify-end gap-0.5">
      {detailHref ? (
        <Link
          href={detailHref}
          aria-label="View details"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), iconActionClass)}
        >
          <Eye className="size-4" />
        </Link>
      ) : null}
      {hasMenuItems ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), iconActionClass)}
            aria-label="Row actions"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            {detailHref ? (
              <DropdownMenuItem onClick={() => router.push(detailHref)}>
                <Eye className="size-4" />
                View
              </DropdownMenuItem>
            ) : null}
            {canEdit ? (
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
            ) : null}
            {canDelete ? (
              <>
                {detailHref || canEdit ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <Trash2 className="size-4" />
                  {deleteLabel}
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
