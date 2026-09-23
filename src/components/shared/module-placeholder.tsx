import { Construction } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

type ModulePlaceholderProps = {
  title: string;
  description: string;
  phaseLabel?: string;
};

export function ModulePlaceholder({
  title,
  description,
  phaseLabel = "Coming in Phase 3+",
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card className="journey-kpi-card border border-dashed border-border/80 bg-card">
        <CardHeader className="flex flex-row items-start gap-4 p-6">
          <div className="rounded-2xl bg-primary p-3 text-primary-foreground shadow-sm">
            <Construction className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base">Module scaffold ready</CardTitle>
            <CardDescription>
              Navigation, auth, and shared layout are wired. Business logic ships in the next
              implementation phase.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{phaseLabel}</p>
        </CardContent>
      </Card>
    </div>
  );
}
