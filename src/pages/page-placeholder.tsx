import { Construction } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

interface PagePlaceholderProps {
  title: string;
  description: string;
}

export function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <section className="solid-surface flex min-h-[380px] flex-col items-center justify-center rounded-lg p-8 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
          <Construction className="size-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Module queued</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          This SK-Fitness CRM module will be implemented after the core application
          shell, data layer, and member workflows are complete.
        </p>
      </section>
    </div>
  );
}