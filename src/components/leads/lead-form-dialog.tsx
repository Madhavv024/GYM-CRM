import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useLeadsStore,
  type CreateLeadInput,
} from "@/features/leads/leads.store";
import { usePlansStore } from "@/features/plans/plans.store";
import { useTrainersStore } from "@/features/trainers/trainers.store";
import type { Lead } from "@/types";

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
}

interface LeadFormValues {
  fullName: string;
  mobile: string;
  email: string;
  interestedPlanId: string;
  source: Lead["source"];
  status: Lead["status"];
  assignedTo: string;
  followUpDate: string;
  notes: string;
}

function getTodayDate() {
  return format(new Date(), "yyyy-MM-dd");
}

function getInitialValues(lead?: Lead): LeadFormValues {
  if (lead) {
    return {
      fullName: lead.fullName,
      mobile: lead.mobile,
      email: lead.email ?? "",
      interestedPlanId: lead.interestedPlanId ?? "",
      source: lead.source,
      status: lead.status,
      assignedTo: lead.assignedTo ?? "",
      followUpDate: lead.followUpDate ?? "",
      notes: lead.notes ?? "",
    };
  }

  return {
    fullName: "",
    mobile: "",
    email: "",
    interestedPlanId: "",
    source: "walk_in",
    status: "new",
    assignedTo: "",
    followUpDate: getTodayDate(),
    notes: "",
  };
}

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
}: LeadFormDialogProps) {
  const plans = usePlansStore((state) => state.plans);
  const trainers = useTrainersStore((state) => state.trainers);
  const addLead = useLeadsStore((state) => state.addLead);
  const updateLead = useLeadsStore((state) => state.updateLead);

  const [values, setValues] = useState<LeadFormValues>(() =>
    getInitialValues(lead),
  );
  const [error, setError] = useState<string | null>(null);

  const activePlans = useMemo(
    () => plans.filter((plan) => plan.isActive),
    [plans],
  );

  const activeTrainers = useMemo(
    () => trainers.filter((trainer) => trainer.isActive),
    [trainers],
  );

  useEffect(() => {
    if (open) {
      setValues(getInitialValues(lead));
      setError(null);
    }
  }, [lead, open]);

  function updateValue<Key extends keyof LeadFormValues>(
    key: Key,
    value: LeadFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    if (!values.fullName.trim()) {
      return "Enter the lead's full name.";
    }

    if (!/^\d{10}$/.test(values.mobile.trim())) {
      return "Enter a valid 10-digit mobile number.";
    }

    if (
      values.status !== "converted" &&
      values.status !== "lost" &&
      !values.followUpDate
    ) {
      return "Set a follow-up date for an active lead.";
    }

    return null;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    const input: CreateLeadInput = {
      fullName: values.fullName,
      mobile: values.mobile,
      email: values.email || undefined,
      interestedPlanId: values.interestedPlanId || undefined,
      source: values.source,
      status: values.status,
      assignedTo: values.assignedTo || undefined,
      followUpDate:
        values.status === "converted" || values.status === "lost"
          ? undefined
          : values.followUpDate || undefined,
      notes: values.notes || undefined,
    };

    if (lead) {
      updateLead(lead.id, input);
      toast.success("Lead updated.");
    } else {
      addLead(input);
      toast.success("Lead added to the pipeline.");
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lead ? "Edit lead" : "Add lead"}</DialogTitle>
          <DialogDescription>
            {lead
              ? "Update lead information and follow-up details."
              : "Capture a new enquiry for the gym sales pipeline."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="lead-full-name" required>
              <Input
                id="lead-full-name"
                value={values.fullName}
                onChange={(event) => updateValue("fullName", event.target.value)}
                placeholder="Riya Kapoor"
              />
            </Field>

            <Field label="Mobile number" htmlFor="lead-mobile" required>
              <Input
                id="lead-mobile"
                inputMode="numeric"
                maxLength={10}
                value={values.mobile}
                onChange={(event) =>
                  updateValue(
                    "mobile",
                    event.target.value.replace(/\D/g, "").slice(0, 10),
                  )
                }
                placeholder="9876543210"
              />
            </Field>

            <Field label="Email" htmlFor="lead-email">
              <Input
                id="lead-email"
                type="email"
                value={values.email}
                onChange={(event) => updateValue("email", event.target.value)}
                placeholder="lead@example.com"
              />
            </Field>

            <Field label="Source" htmlFor="lead-source">
              <Select
                id="lead-source"
                value={values.source}
                onChange={(event) =>
                  updateValue("source", event.target.value as Lead["source"])
                }
              >
                <option value="walk_in">Walk-in</option>
                <option value="instagram">Instagram</option>
                <option value="google">Google</option>
                <option value="referral">Referral</option>
                <option value="phone">Phone call</option>
                <option value="website">Website</option>
              </Select>
            </Field>

            <Field label="Interested plan" htmlFor="lead-plan">
              <Select
                id="lead-plan"
                value={values.interestedPlanId}
                onChange={(event) =>
                  updateValue("interestedPlanId", event.target.value)
                }
              >
                <option value="">Not specified</option>
                {activePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Assigned trainer" htmlFor="lead-assigned-to">
              <Select
                id="lead-assigned-to"
                value={values.assignedTo}
                onChange={(event) =>
                  updateValue("assignedTo", event.target.value)
                }
              >
                <option value="">Not assigned</option>
                {activeTrainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.fullName}>
                    {trainer.fullName}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Pipeline status" htmlFor="lead-status">
              <Select
                id="lead-status"
                value={values.status}
                onChange={(event) =>
                  updateValue("status", event.target.value as Lead["status"])
                }
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="follow_up">Follow-up</option>
                <option value="trial_booked">Trial booked</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </Select>
            </Field>

            <Field label="Follow-up date" htmlFor="lead-follow-up">
              <Input
                id="lead-follow-up"
                type="date"
                disabled={
                  values.status === "converted" || values.status === "lost"
                }
                value={values.followUpDate}
                onChange={(event) =>
                  updateValue("followUpDate", event.target.value)
                }
              />
            </Field>
          </div>

          <Field label="Notes" htmlFor="lead-notes">
            <Textarea
              id="lead-notes"
              value={values.notes}
              onChange={(event) => updateValue("notes", event.target.value)}
              placeholder="Fitness goal, preferred time, trial discussion, or follow-up context"
            />
          </Field>

          {error ? (
            <p className="rounded-md border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{lead ? "Save changes" : "Add lead"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  required = false,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-1 text-primary">*</span> : null}
      </Label>
      {children}
    </div>
  );
}