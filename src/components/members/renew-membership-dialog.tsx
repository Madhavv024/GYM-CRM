import { addDays, format, parseISO } from "date-fns";
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
import { useMembersStore } from "@/features/members/members.store";
import { formatCurrency, getMemberFullName } from "@/features/members/members.utils";
import { usePlansStore } from "@/features/plans/plans.store";
import type { Member } from "@/types";

interface RenewMembershipDialogProps {
  member: Member | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RenewalFormValues {
  planId: string;
  startDate: string;
  notes: string;
}

function getTodayDate() {
  return format(new Date(), "yyyy-MM-dd");
}

function getInitialValues(member: Member | undefined): RenewalFormValues {
  return {
    planId: member?.planId ?? "",
    startDate: getTodayDate(),
    notes: "",
  };
}

export function RenewMembershipDialog({
  member,
  open,
  onOpenChange,
}: RenewMembershipDialogProps) {
  const plans = usePlansStore((state) => state.plans);
  const renewMembership = useMembersStore((state) => state.renewMembership);

  const [values, setValues] = useState<RenewalFormValues>(() =>
    getInitialValues(member),
  );
  const [error, setError] = useState<string | null>(null);

  const activePlans = useMemo(
    () => plans.filter((plan) => plan.isActive),
    [plans],
  );

  const selectedPlan = activePlans.find((plan) => plan.id === values.planId);

  const endDate = useMemo(() => {
    if (!selectedPlan || !values.startDate) {
      return "";
    }

    return format(
      addDays(parseISO(values.startDate), selectedPlan.durationInDays - 1),
      "yyyy-MM-dd",
    );
  }, [selectedPlan, values.startDate]);

  useEffect(() => {
    if (open) {
      setValues(getInitialValues(member));
      setError(null);
    }
  }, [member, open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!member) {
      return;
    }

    if (!selectedPlan) {
      setError("Select an active membership plan.");
      return;
    }

    if (!values.startDate || !endDate) {
      setError("Select a valid renewal start date.");
      return;
    }

    renewMembership(member.id, {
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      startDate: values.startDate,
      endDate,
      price: selectedPlan.price,
      notes: values.notes.trim() || undefined,
    });

    toast.success(`${getMemberFullName(member)} renewed successfully.`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Renew membership</DialogTitle>
          <DialogDescription>
            Start a new membership period for {member ? getMemberFullName(member) : "this member"}.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Current membership
            </p>
            <p className="mt-2 font-bold text-foreground">
              {member?.membershipStartDate} to {member?.membershipEndDate}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Membership plan" htmlFor="renewal-plan">
              <Select
                id="renewal-plan"
                value={values.planId}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    planId: event.target.value,
                  }))
                }
              >
                <option value="">Select plan</option>
                {activePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} · {formatCurrency(plan.price)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Renewal start date" htmlFor="renewal-start-date">
              <Input
                id="renewal-start-date"
                type="date"
                value={values.startDate}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
              />
            </Field>

            <Field label="New end date" htmlFor="renewal-end-date">
              <Input
                id="renewal-end-date"
                value={endDate}
                disabled
                readOnly
              />
            </Field>

            <div className="space-y-2">
              <Label>Plan amount</Label>
              <div className="flex h-10 items-center rounded-md border border-border bg-muted/30 px-3 text-sm font-semibold text-foreground">
                {selectedPlan ? formatCurrency(selectedPlan.price) : "—"}
              </div>
            </div>
          </div>

          <Field label="Renewal notes" htmlFor="renewal-notes">
            <Textarea
              id="renewal-notes"
              value={values.notes}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              placeholder="Optional renewal note"
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
            <Button type="submit">Renew membership</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}