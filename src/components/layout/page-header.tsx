import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
};

export function PageHeader({ title, description, actions, meta }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-2 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">{title}</h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
        {meta && (
          <div className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {meta}
          </div>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
