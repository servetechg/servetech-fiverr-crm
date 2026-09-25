import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ColumnMeta generic required by TanStack
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "right";
  }
}
