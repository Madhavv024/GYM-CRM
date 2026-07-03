import { useMemo, useState } from "react";
import {
  Edit3,
  Funnel,
  Plus,
  Search,
  Trash2,
  UserRoundPlus,
  X,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConvertLeadDialog } from "@/components/leads/convert-lead-dialog";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  filterLeads,
  initialLeadFilters,
  type LeadFilters,
} from "@/features/leads/leads.filters";
import { useLeadsStore } from "@/features/leads/leads.store";
import {
  canConvertLead,
  formatLeadDate,
  getDueFollowUps,
  getLeadSourceLabel,
  getLeadStatusLabel,
  isLeadFollowUpDue,
} from "@/features/leads/leads.utils";
import { usePlansStore } from "@/features/plans/plans.store";
import type { Lead } from "@/types";

export function LeadsPage() {
  const leads = useLeadsStore((state) => state.leads);
  const deleteLead = useLeadsStore((state) => state.deleteLead);
  const plans = usePlansStore((state) => state.plans);

  const [filters, setFilters] = useState<LeadFilters>(initialLeadFilters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | undefined>();
  const [leadToConvert, setLeadToConvert] = useState<Lead | undefined>();
  const [leadToDelete, setLeadToDelete] = useState<Lead | undefined>();

  const dueFollowUps = useMemo(() => getDueFollowUps(leads), [leads]);

  const filteredLeads = useMemo(
    () => filterLeads(leads, filters, isLeadFollowUpDue),
    [filters, leads],
  );

  const activeFilterCount = [
    filters.query.trim().length > 0,
    filters.status !== "all",
    filters.source !== "all",
    filters.followUp !== "all",
  ].filter(Boolean).length;

  const pipelineCounts = useMemo(
    () => ({
      open: leads.filter(
        (lead) => lead.status !== "converted" && lead.status !== "lost",
      ).length,
      due: dueFollowUps.length,
      converted: leads.filter((lead) => lead.status === "converted").length,
      total: leads.length,
    }),
    [dueFollowUps.length, leads],
  );

  function updateFilters(updates: Partial<LeadFilters>) {
    setFilters((current) => ({ ...current, ...updates }));
  }

  function handleCreateLead() {
    setLeadToEdit(undefined);
    setIsFormOpen(true);
  }

  function handleEditLead(lead: Lead) {
    setLeadToEdit(lead);
    setIsFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setIsFormOpen(open);

    if (!open) {
      setLeadToEdit(undefined);
    }
  }

  function handleDeleteLead() {
    if (!leadToDelete) {
      return;
    }

    const leadName = leadToDelete.fullName;

    deleteLead(leadToDelete.id);
    toast.success(`${leadName} was removed from the pipeline.`);
    setLeadToDelete(undefined);
  }

  function clearFilters() {
    setFilters(initialLeadFilters);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Sales pipeline
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
            Leads
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Track enquiries, manage follow-ups, and convert qualified leads into
            member profiles.
          </p>
        </div>

        <Button onClick={handleCreateLead}>
          <Plus className="size-4" />
          Add lead
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Open leads"
          value={String(pipelineCounts.open)}
          description="Active sales conversations"
        />
        <SummaryCard
          label="Follow-ups due"
          value={String(pipelineCounts.due)}
          description="Due today or overdue"
        />
        <SummaryCard
          label="Converted"
          value={String(pipelineCounts.converted)}
          description="Converted to members"
        />
        <SummaryCard
          label="Total enquiries"
          value={String(pipelineCounts.total)}
          description="All local lead records"
        />
      </section>

      <section className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Lead pipeline
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredLeads.length} of {leads.length} leads shown
            </p>
          </div>

          {activeFilterCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-3.5" />
              Clear filters ({activeFilterCount})
            </Button>
          ) : null}
        </div>

        <div className="grid gap-3 border-b border-border bg-muted/20 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_160px_160px_160px]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={filters.query}
              onChange={(event) => updateFilters({ query: event.target.value })}
              className="pl-9"
              placeholder="Search name, mobile, email"
              aria-label="Search leads"
            />
          </div>

          <Select
            value={filters.status}
            onChange={(event) =>
              updateFilters({
                status: event.target.value as LeadFilters["status"],
              })
            }
            aria-label="Filter by lead status"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="follow_up">Follow-up</option>
            <option value="trial_booked">Trial booked</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </Select>

          <Select
            value={filters.source}
            onChange={(event) =>
              updateFilters({
                source: event.target.value as LeadFilters["source"],
              })
            }
            aria-label="Filter by lead source"
          >
            <option value="all">All sources</option>
            <option value="walk_in">Walk-in</option>
            <option value="instagram">Instagram</option>
            <option value="google">Google</option>
            <option value="referral">Referral</option>
            <option value="phone">Phone call</option>
            <option value="website">Website</option>
          </Select>

          <Select
            value={filters.followUp}
            onChange={(event) =>
              updateFilters({
                followUp: event.target.value as LeadFilters["followUp"],
              })
            }
            aria-label="Filter by follow-up"
          >
            <option value="all">All follow-ups</option>
            <option value="due">Due now</option>
            <option value="scheduled">Scheduled</option>
            <option value="none">No follow-up</option>
          </Select>
        </div>

        {filteredLeads.length === 0 ? (
          <EmptyState
            className="m-4"
            icon={<Funnel className="size-5" />}
            title={leads.length === 0 ? "No leads captured" : "No leads found"}
            description={
              leads.length === 0
                ? "Add the first gym enquiry to begin tracking your sales pipeline."
                : "Try changing the search term or clearing the active filters."
            }
            action={
              leads.length === 0 ? (
                <Button onClick={handleCreateLead}>
                  <Plus className="size-4" />
                  Add lead
                </Button>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1080px] text-left">
                <thead className="bg-muted/30 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Lead</th>
                    <th className="px-5 py-3">Interested plan</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">Follow-up</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead) => (
                    <LeadTableRow
                      key={lead.id}
                      lead={lead}
                      planName={getPlanName(lead, plans)}
                      onEdit={handleEditLead}
                      onConvert={setLeadToConvert}
                      onDelete={setLeadToDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filteredLeads.map((lead) => (
                <LeadMobileCard
                  key={lead.id}
                  lead={lead}
                  planName={getPlanName(lead, plans)}
                  onEdit={handleEditLead}
                  onConvert={setLeadToConvert}
                  onDelete={setLeadToDelete}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <LeadFormDialog
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        lead={leadToEdit}
      />

      <ConvertLeadDialog
        open={Boolean(leadToConvert)}
        onOpenChange={(open) => {
          if (!open) {
            setLeadToConvert(undefined);
          }
        }}
        lead={leadToConvert}
      />

      <DeleteLeadDialog
        lead={leadToDelete}
        onConfirm={handleDeleteLead}
        onOpenChange={(open) => {
          if (!open) {
            setLeadToDelete(undefined);
          }
        }}
      />
    </div>
  );
}

function LeadTableRow({
  lead,
  planName,
  onEdit,
  onConvert,
  onDelete,
}: {
  lead: Lead;
  planName: string;
  onEdit: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}) {
  const followUpDue = isLeadFollowUpDue(lead);

  return (
    <tr className="transition-colors hover:bg-white/[0.025]">
      <td className="px-5 py-4">
        <p className="font-bold text-foreground">{lead.fullName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{lead.mobile}</p>
        {lead.email ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{lead.email}</p>
        ) : null}
      </td>
      <td className="px-5 py-4 text-sm text-muted-foreground">{planName}</td>
      <td className="px-5 py-4">
        <Badge variant="muted">{getLeadSourceLabel(lead.source)}</Badge>
      </td>
      <td className="px-5 py-4">
        {lead.followUpDate ? (
          <div>
            <p
              className={
                followUpDue
                  ? "text-sm font-bold text-warning"
                  : "text-sm text-foreground"
              }
            >
              {formatLeadDate(lead.followUpDate)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {followUpDue ? "Due now" : "Scheduled"}
            </p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Not scheduled</span>
        )}
      </td>
      <td className="px-5 py-4">
        <LeadStatusBadge status={lead.status} />
      </td>
      <td className="px-5 py-4">
        <LeadActions
          lead={lead}
          onEdit={onEdit}
          onConvert={onConvert}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

function LeadMobileCard({
  lead,
  planName,
  onEdit,
  onConvert,
  onDelete,
}: {
  lead: Lead;
  planName: string;
  onEdit: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}) {
  const followUpDue = isLeadFollowUpDue(lead);

  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-foreground">{lead.fullName}</p>
          <p className="mt-1 text-sm text-muted-foreground">{lead.mobile}</p>
          {lead.email ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{lead.email}</p>
          ) : null}
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Plan
          </dt>
          <dd className="mt-1 font-medium text-foreground">{planName}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Source
          </dt>
          <dd className="mt-1">
            <Badge variant="muted">{getLeadSourceLabel(lead.source)}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Follow-up
          </dt>
          <dd
            className={
              followUpDue
                ? "mt-1 font-bold text-warning"
                : "mt-1 font-medium text-foreground"
            }
          >
            {lead.followUpDate
              ? `${formatLeadDate(lead.followUpDate)}${
                  followUpDue ? " · Due now" : ""
                }`
              : "Not scheduled"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-border pt-3">
        <LeadActions
          lead={lead}
          onEdit={onEdit}
          onConvert={onConvert}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}

function LeadActions({
  lead,
  onEdit,
  onConvert,
  onDelete,
}: {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {canConvertLead(lead) ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onConvert(lead)}
          aria-label={`Convert ${lead.fullName} to member`}
          title="Convert to member"
        >
          <UserRoundPlus className="size-4 text-primary" />
        </Button>
      ) : null}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(lead)}
        aria-label={`Edit ${lead.fullName}`}
        title="Edit lead"
      >
        <Edit3 className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-danger hover:bg-danger/10 hover:text-danger"
        onClick={() => onDelete(lead)}
        aria-label={`Delete ${lead.fullName}`}
        title="Delete lead"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function LeadStatusBadge({ status }: { status: Lead["status"] }) {
  const variantByStatus: Record<
    Lead["status"],
    "default" | "success" | "warning" | "danger" | "info" | "muted"
  > = {
    new: "info",
    contacted: "default",
    follow_up: "warning",
    trial_booked: "info",
    converted: "success",
    lost: "danger",
  };

  return (
    <Badge variant={variantByStatus[status]}>
      {getLeadStatusLabel(status)}
    </Badge>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="glass-surface rounded-lg border border-border p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </article>
  );
}

function DeleteLeadDialog({
  lead,
  onConfirm,
  onOpenChange,
}: {
  lead: Lead | undefined;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={Boolean(lead)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete lead?</AlertDialogTitle>
          <AlertDialogDescription>
            {lead
              ? `This will permanently remove ${lead.fullName} from the sales pipeline. This action cannot be undone.`
              : "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              className="bg-danger text-white hover:bg-danger/90"
              onClick={onConfirm}
            >
              Delete lead
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getPlanName(
  lead: Lead,
  plans: ReturnType<typeof usePlansStore.getState>["plans"],
) {
  if (!lead.interestedPlanId) {
    return "Not specified";
  }

  return (
    plans.find((plan) => plan.id === lead.interestedPlanId)?.name ??
    "Deleted plan"
  );
}