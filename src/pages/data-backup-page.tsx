import { Download, FileUp, RotateCcw, ShieldAlert } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  downloadCrmBackup,
  getBackupSummary,
  parseCrmBackupFile,
  restoreCrmBackup,
} from "@/features/backup/backup.utils";
import type { CrmBackup } from "@/features/backup/backup.types";

export function DataBackupPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [backupToRestore, setBackupToRestore] = useState<CrmBackup | null>(
    null,
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const summary = backupToRestore
    ? getBackupSummary(backupToRestore.data)
    : null;

  async function handleExport() {
    try {
      setIsExporting(true);
      await downloadCrmBackup();
      toast.success("CRM backup downloaded.");
    } catch {
      toast.error("Unable to create the backup file.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const result = await parseCrmBackupFile(file);

    if (!result.valid) {
      toast.error(result.error);
      event.target.value = "";
      return;
    }

    setBackupToRestore(result.backup);
    event.target.value = "";
  }

  async function handleRestore() {
    if (!backupToRestore) {
      return;
    }

    try {
      setIsRestoring(true);
      await restoreCrmBackup(backupToRestore);

      toast.success("Backup restored. Reloading CRM...");
      window.setTimeout(() => window.location.reload(), 700);
    } catch {
      setIsRestoring(false);
      toast.error("Restore failed. Your current data was not changed.");
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
            Data management
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Backup & Restore
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Download a complete backup of your CRM data or restore a previously
            exported backup file.
          </p>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Download className="size-5" />
            </div>

            <h2 className="mt-5 text-lg font-black text-foreground">
              Export CRM data
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Download members, plans, payments, leads, expenses, appointments,
              and trainers as a versioned JSON backup.
            </p>

            <Button
              className="mt-5"
              disabled={isExporting}
              onClick={handleExport}
            >
              <Download className="mr-2 size-4" />
              {isExporting ? "Preparing backup..." : "Download backup"}
            </Button>
          </article>

          <article className="rounded-xl border border-danger/25 bg-danger/5 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-danger/10 text-danger">
              <FileUp className="size-5" />
            </div>

            <h2 className="mt-5 text-lg font-black text-foreground">
              Restore CRM data
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Restoring replaces all current CRM data. Export a fresh backup
              before continuing.
            </p>

            <input
              ref={inputRef}
              accept="application/json,.json"
              className="hidden"
              onChange={handleFileChange}
              type="file"
            />

            <Button
              className="mt-5"
              onClick={() => inputRef.current?.click()}
              variant="outline"
            >
              <FileUp className="mr-2 size-4" />
              Select backup file
            </Button>
          </article>
        </section>

        <article className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
            <div>
              <h2 className="font-black text-foreground">
                Restore safety rules
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Restore replaces existing records instead of merging them.
                This avoids duplicate members, payments, and broken record
                relationships.
              </p>
            </div>
          </div>
        </article>
      </div>

      <AlertDialog
        open={Boolean(backupToRestore)}
        onOpenChange={(open) => {
          if (!open && !isRestoring) {
            setBackupToRestore(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently replace all current CRM data with the
              selected backup. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {backupToRestore && summary ? (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-4 text-sm sm:grid-cols-3">
              <SummaryItem label="Members" value={summary.members} />
              <SummaryItem label="Plans" value={summary.plans} />
              <SummaryItem label="Payments" value={summary.payments} />
              <SummaryItem label="Leads" value={summary.leads} />
              <SummaryItem label="Expenses" value={summary.expenses} />
              <SummaryItem label="Appointments" value={summary.appointments} />
              <SummaryItem label="Trainers" value={summary.trainers} />
            </div>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger text-danger-foreground hover:bg-danger/90"
              disabled={isRestoring}
              onClick={(event) => {
                event.preventDefault();
                void handleRestore();
              }}
            >
              <RotateCcw className="mr-2 size-4" />
              {isRestoring ? "Restoring..." : "Replace and restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-foreground">{value}</p>
    </div>
  );
}