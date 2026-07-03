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
import { useLeadsStore } from "@/features/leads/leads.store";
import { useMembersStore } from "@/features/members/members.store";
import { usePlansStore } from "@/features/plans/plans.store";
import { useTrainersStore } from "@/features/trainers/trainers.store";
import type { Lead, Member } from "@/types";

interface ConvertLeadDialogProps {
    lead?: Lead;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface ConversionValues {
    firstName: string;
    lastName: string;
    gender: Member["gender"];
    planId: string;
    membershipStartDate: string;
    membershipEndDate: string;
    assignedTrainerId: string;
    notes: string;
}

function getTodayDate() {
    return format(new Date(), "yyyy-MM-dd");
}

function splitFullName(fullName: string) {
    const nameParts = fullName.trim().split(/\s+/);

    return {
        firstName: nameParts[0] ?? "",
        lastName: nameParts.slice(1).join(" "),
    };
}

function getInitialValues(lead?: Lead): ConversionValues {
    const { firstName, lastName } = splitFullName(lead?.fullName ?? "");

    return {
        firstName,
        lastName,
        gender: "male",
        planId: lead?.interestedPlanId ?? "",
        membershipStartDate: getTodayDate(),
        membershipEndDate: "",
        assignedTrainerId: "",
        notes: lead?.notes ?? "",
    };
}

export function ConvertLeadDialog({
    lead,
    open,
    onOpenChange,
}: ConvertLeadDialogProps) {
    const plans = usePlansStore((state) => state.plans);
    const trainers = useTrainersStore((state) => state.trainers);
    const addMember = useMembersStore((state) => state.addMember);
    const convertLead = useLeadsStore((state) => state.convertLead);

    const [values, setValues] = useState<ConversionValues>(() =>
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

    function updateValue<Key extends keyof ConversionValues>(
        key: Key,
        value: ConversionValues[Key],
    ) {
        setValues((current) => ({ ...current, [key]: value }));
    }

    function handlePlanChange(planId: string) {
        const selectedPlan = plans.find((plan) => plan.id === planId);

        if (!selectedPlan) {
            updateValue("planId", "");
            return;
        }

        const startDate = values.membershipStartDate || getTodayDate();

        setValues((current) => ({
            ...current,
            planId,
            membershipStartDate: startDate,
            membershipEndDate: format(
                addDays(parseISO(startDate), selectedPlan.durationInDays - 1),
                "yyyy-MM-dd",
            ),
        }));
    }

    function handleStartDateChange(startDate: string) {
        const selectedPlan = plans.find((plan) => plan.id === values.planId);

        setValues((current) => ({
            ...current,
            membershipStartDate: startDate,
            membershipEndDate: selectedPlan
                ? format(
                    addDays(parseISO(startDate), selectedPlan.durationInDays - 1),
                    "yyyy-MM-dd",
                )
                : current.membershipEndDate,
        }));
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!lead) {
            return;
        }

        if (!values.firstName.trim() || !values.lastName.trim()) {
            setError("Enter the member's first and last name.");
            return;
        }

        if (!values.planId || !values.membershipStartDate || !values.membershipEndDate) {
            setError("Select a plan and set the membership dates.");
            return;
        }

        const selectedPlan = plans.find((plan) => plan.id === values.planId);

        if (!selectedPlan) {
            setError("The selected membership plan is no longer available.");
            return;
        }

        const member = addMember({
            firstName: values.firstName,
            lastName: values.lastName,
            mobile: lead.mobile,
            email: lead.email,
            gender: values.gender,
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            planPrice: selectedPlan.price + selectedPlan.joiningFee,
            membershipStartDate: values.membershipStartDate,
            membershipEndDate: values.membershipEndDate,
            assignedTrainerId: values.assignedTrainerId || undefined,
            notes: values.notes || undefined,
        });

        convertLead(lead.id, member.id);
        toast.success(`${member.firstName} was converted into a member.`);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Convert lead to member</DialogTitle>
                    <DialogDescription>
                        Create the member profile from this lead. Payment can be recorded separately.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="First name" htmlFor="conversion-first-name" required>
                            <Input
                                id="conversion-first-name"
                                value={values.firstName}
                                onChange={(event) => updateValue("firstName", event.target.value)}
                            />
                        </Field>

                        <Field label="Last name" htmlFor="conversion-last-name" required>
                            <Input
                                id="conversion-last-name"
                                value={values.lastName}
                                onChange={(event) => updateValue("lastName", event.target.value)}
                            />
                        </Field>

                        <Field label="Mobile number" htmlFor="conversion-mobile">
                            <Input id="conversion-mobile" value={lead?.mobile ?? ""} disabled />
                        </Field>

                        <Field label="Gender" htmlFor="conversion-gender">
                            <Select
                                id="conversion-gender"
                                value={values.gender}
                                onChange={(event) =>
                                    updateValue("gender", event.target.value as Member["gender"])
                                }
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </Select>
                        </Field>

                        <Field label="Membership plan" htmlFor="conversion-plan" required>
                            <Select
                                id="conversion-plan"
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

                        <Field label="Assigned trainer" htmlFor="conversion-trainer">
                            <Select
                                id="conversion-trainer"
                                value={values.assignedTrainerId}
                                onChange={(event) =>
                                    updateValue("assignedTrainerId", event.target.value)
                                }
                            >
                                <option value="">No trainer assigned</option>
                                {activeTrainers.map((trainer) => (
                                    <option key={trainer.id} value={trainer.id}>
                                        {trainer.fullName}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Start date" htmlFor="conversion-start-date" required>
                            <Input
                                id="conversion-start-date"
                                type="date"
                                value={values.membershipStartDate}
                                onChange={(event) => handleStartDateChange(event.target.value)}
                            />
                        </Field>

                        <Field label="End date" htmlFor="conversion-end-date" required>
                            <Input
                                id="conversion-end-date"
                                type="date"
                                value={values.membershipEndDate}
                                onChange={(event) =>
                                    updateValue("membershipEndDate", event.target.value)
                                }
                            />
                        </Field>
                    </div>

                    <Field label="Member notes" htmlFor="conversion-notes">
                        <Textarea
                            id="conversion-notes"
                            value={values.notes}
                            onChange={(event) => updateValue("notes", event.target.value)}
                            placeholder="Optional member notes"
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
                        <Button type="submit">Create member</Button>
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