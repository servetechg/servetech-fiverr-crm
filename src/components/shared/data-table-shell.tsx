"use client";

import type { ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils/cn";

type DataTableShellProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  emptyMessage?: string;
  footer?: ReactNode;
  /** Column ids pinned to the right while the table scrolls horizontally */
  stickyColumnIds?: string[];
};

function isStickyColumn(columnId: string, stickyColumnIds: string[] | undefined): boolean {
  return stickyColumnIds?.includes(columnId) ?? false;
}

const stickyHeadClassName =
  "data-table-sticky-head sticky right-0 z-20 shadow-[-8px_0_16px_-10px_rgb(20_20_20/0.12)] dark:shadow-[-8px_0_16px_-10px_rgb(0_0_0/0.45)]";

const stickyCellClassName =
  "data-table-sticky-cell sticky right-0 z-10 shadow-[-8px_0_16px_-10px_rgb(20_20_20/0.1)] dark:shadow-[-8px_0_16px_-10px_rgb(0_0_0/0.35)]";

export function DataTableShell<TData>({
  columns,
  data,
  emptyMessage = "No records yet.",
  footer,
  stickyColumnIds,
}: DataTableShellProps<TData>) {
  // TanStack Table is intentionally used here; React Compiler skips memoization for this hook.
  // eslint-disable-next-line react-hooks/incompatible-library -- shared table shell (Phase 2)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const scrollable = Boolean(stickyColumnIds?.length);

  return (
    <div className="data-table-panel overflow-hidden">
      <div
        className={cn(
          "relative w-full",
          scrollable && "scroll-surface overflow-x-auto overscroll-x-contain",
        )}
      >
        <table
          data-slot="table"
          className={cn(
            "w-full caption-bottom text-sm",
            scrollable && "min-w-max",
          )}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id;
                  const sticky = isStickyColumn(columnId, stickyColumnIds);
                  const align = header.column.columnDef.meta?.align;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        scrollable && "whitespace-nowrap",
                        align === "right" && "text-right",
                        sticky && stickyHeadClassName,
                        sticky && "min-w-[6.5rem]",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const columnId = cell.column.id;
                    const sticky = isStickyColumn(columnId, stickyColumnIds);
                    const align = cell.column.columnDef.meta?.align;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          scrollable && "whitespace-nowrap",
                          align === "right" && "text-right",
                          sticky && stickyCellClassName,
                          sticky && "min-w-[6.5rem]",
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
      </div>
      {footer ? <div className="data-table-footer">{footer}</div> : null}
    </div>
  );
}
