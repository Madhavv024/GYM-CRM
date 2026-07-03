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
import { usePlansStore } from "@/features/plans/plans.store";
import { getMemberFullName } from "@/features/members/members.utils";
import type { Member } from "@/types";

interface MemberRenewalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
}

interface RenewalValues {
  planId: string;
  startDate: string;
  endDate: string;
  notes: string;
}

function getInitialValues(member: Member): RenewalValues {
  const today = format(new Date(), "yyyy-MM-dd");
  const startDate =
    member.membershipEndDate >= today
      ? format(addDays(parseISO(member.membershipEndDate), 1), "yyyy-MM-dd")
      : today;

  return {
    planId: member.planId,
    startDate,
    endDate: "",
    notes: "",
  };
}

export function MemberRenewalDialog({
  open,
  onOpenChange,
  member,
}: MemberRenewalDialogProps) {
  const plans = usePlansStore((state) => state.plans);
  const renewMembership = useMembersStore((state) => state.renewMembership);

  const activePlans = useMemo(
    () => plans.filter((plan) => plan.isActive),
    [plans],
  );

  const [values, setValues] = useState<RenewalValues>(() =>
    getInitialValues(member),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const initialValues = getInitialValues(member);
    const selectedPlan = plans.find((plan) => plan.id === initialValues.planId);

    setValues({
      ...initialValues,
      endDate: selectedPlan
        ? format(
            addDays(
              parseISO(initialValues.startDate),
              selectedPlan.durationInDays - 1,
            ),
            "yyyy-MM-dd",
          )
        : "",
    });
    setError(null);
  }, [member, open, plans]);

  function updateValue<Key extends keyof RenewalValues>(
    key: Key,
    value: RenewalValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function calculateEndDate(planId: string, startDate: string) {
    const selectedPlan = plans.find((plan) => plan.id === planId);

    if (!selectedPlan || !startDate) {
      return "";
    }

    return format(
      addDays(parseISO(startDate), selectedPlan.durationInDays - 1),
      "yyyy-MM-dd",
    );
  }

  function handlePlanChange(planId: string) {
    setValues((current) => ({
      ...current,
      planId,
      endDate: calculateEndDate(planId, current.startDate),
    }));
  }

  function handleStartDateChange(startDate: string) {
    setValues((current) => ({
      ...current,
      startDate,
      endDate: calculateEndDate(current.planId, startDate),
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedPlan = plans.find((plan) => plan.id === values.planId);

    if (!selectedPlan) {
      setError("Select an active membership plan.");
      return;
    }

    if (!values.startDate || !values.endDate) {
      setError("Set the renewal start and end dates.");
      return;
    }

    renewMembership(member.id, {
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      startDate: values.startDate,
      endDate: values.endDate,
      price: selectedPlan.price + selectedPlan.joiningFee,
      notes: values.notes.trim() || undefined,
    });

    toast.success(`${getMemberFullName(member)}'s membership was renewed.`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renew membership</DialogTitle>
          <DialogDescription>
            Create a new membership cycle for {getMemberFullName(member)}.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Membership plan" htmlFor="renewal-plan">
              <Select
                id="renewal-plan"
                value={values.planId}
                onChange={(event) => handlePlanChange(event.target.value)}
              >
                <option value="">Select a plan</option>
                {activePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — ₹{plan.price + plan.joiningFee}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Renewal start date" htmlFor="renewal-start-date">
              <Input
                id="renewal-start-date"
                type="date"
                value={values.startDate}
                onChange={(event) => handleStartDateChange(event.target.value)}
              />
            </Field>

            <Field label="Renewal end date" htmlFor="renewal-end-date">
              <Input
                id="renewal-end-date"
                type="date"
                value={values.endDate}
                onChange={(event) => updateValue("endDate", event.target.value)}
              />
            </Field>
          </div>

          <Field label="Renewal notes" htmlFor="renewal-notes">
            <Textarea
              id="renewal-notes"
              value={values.notes}
              onChange={(event) => updateValue("notes", event.target.value)}
              placeholder="Optional front-desk note for this renewal"
            />
          </Field>

          {error ? (
            <p className="rounded-md border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
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