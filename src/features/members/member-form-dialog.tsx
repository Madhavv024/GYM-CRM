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
import { useTrainersStore } from "@/features/trainers/trainers.store";
import type { Member } from "@/types";

interface MemberFormDialogProps {
open: boolean;
onOpenChange: (open: boolean) => void;
member?: Member;
}

interface MemberFormValues {
firstName: string;
lastName: string;
mobile: string;
email: string;
gender: Member["gender"];
planId: string;
membershipStartDate: string;
membershipEndDate: string;
assignedTrainerId: string;
address: string;
emergencyContactName: string;
emergencyContactMobile: string;
notes: string;
}

function getTodayDate() {
return format(new Date(), "yyyy-MM-dd");
}

function getInitialValues(member?: Member): MemberFormValues {
if (member) {
    return {
    firstName: member.firstName,
    lastName: member.lastName,
    mobile: member.mobile,
    email: member.email ?? "",
    gender: member.gender,
    planId: member.planId,
    membershipStartDate: member.membershipStartDate,
    membershipEndDate: member.membershipEndDate,
    assignedTrainerId: member.assignedTrainerId ?? "",
    address: member.address ?? "",
    emergencyContactName: member.emergencyContactName ?? "",
    emergencyContactMobile: member.emergencyContactMobile ?? "",
    notes: member.notes ?? "",
    };
}

return {
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    gender: "male",
    planId: "",
    membershipStartDate: getTodayDate(),
    membershipEndDate: "",
    assignedTrainerId: "",
    address: "",
    emergencyContactName: "",
    emergencyContactMobile: "",
    notes: "",
};
}

export function MemberFormDialog({
open,
onOpenChange,
member,
}: MemberFormDialogProps) {
const plans = usePlansStore((state) => state.plans);
const trainers = useTrainersStore((state) => state.trainers);
const addMember = useMembersStore((state) => state.addMember);
const updateMember = useMembersStore((state) => state.updateMember);

const [values, setValues] = useState<MemberFormValues>(() =>
    getInitialValues(member),
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
    setValues(getInitialValues(member));
    setError(null);
    }
}, [member, open]);

function updateValue<Key extends keyof MemberFormValues>(
    key: Key,
    value: MemberFormValues[Key],
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
    const calculatedEndDate = format(
    addDays(parseISO(startDate), selectedPlan.durationInDays - 1),
    "yyyy-MM-dd",
    );

    setValues((current) => ({
    ...current,
    planId,
    membershipStartDate: startDate,
    membershipEndDate: calculatedEndDate,
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

function validate() {
    if (!values.firstName.trim() || !values.lastName.trim()) {
    return "Enter the member's full name.";
    }

    if (!/^\d{10}$/.test(values.mobile.trim())) {
    return "Enter a valid 10-digit mobile number.";
    }

    if (!values.planId) {
    return "Select a membership plan.";
    }

    if (!values.membershipStartDate || !values.membershipEndDate) {
    return "Set the membership start and end dates.";
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

    const selectedPlan = plans.find((plan) => plan.id === values.planId);

    if (!selectedPlan) {
    setError("The selected membership plan is no longer available.");
    return;
    }

    if (member) {
    updateMember(member.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        mobile: values.mobile,
        email: values.email || undefined,
        gender: values.gender,
        planId: values.planId,
        membershipStartDate: values.membershipStartDate,
        membershipEndDate: values.membershipEndDate,
        assignedTrainerId: values.assignedTrainerId || undefined,
        address: values.address || undefined,
        emergencyContactName: values.emergencyContactName || undefined,
        emergencyContactMobile: values.emergencyContactMobile || undefined,
        notes: values.notes || undefined,
    });

    toast.success("Member profile updated.");
    } else {
    addMember({
        firstName: values.firstName,
        lastName: values.lastName,
        mobile: values.mobile,
        email: values.email || undefined,
        gender: values.gender,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        planPrice: selectedPlan.price + selectedPlan.joiningFee,
        membershipStartDate: values.membershipStartDate,
        membershipEndDate: values.membershipEndDate,
        assignedTrainerId: values.assignedTrainerId || undefined,
        address: values.address || undefined,
        emergencyContactName: values.emergencyContactName || undefined,
        emergencyContactMobile: values.emergencyContactMobile || undefined,
        notes: values.notes || undefined,
    });

    toast.success("New member added to SK-Fitness CRM.");
    }

    onOpenChange(false);
}

return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl">
        <DialogHeader>
        <DialogTitle>{member ? "Edit member" : "Add new member"}</DialogTitle>
        <DialogDescription>
            {member
            ? "Update profile and membership information."
            : "Create a member profile and assign an active membership plan."}
        </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="space-y-4">
            <h3 className="text-sm font-bold text-primary">Profile details</h3>

            <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="member-first-name" required>
                <Input
                id="member-first-name"
                value={values.firstName}
                onChange={(event) => updateValue("firstName", event.target.value)}
                placeholder="Arjun"
                />
            </Field>

            <Field label="Last name" htmlFor="member-last-name" required>
                <Input
                id="member-last-name"
                value={values.lastName}
                onChange={(event) => updateValue("lastName", event.target.value)}
                placeholder="Mehta"
                />
            </Field>

            <Field label="Mobile number" htmlFor="member-mobile" required>
                <Input
                id="member-mobile"
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

            <Field label="Email" htmlFor="member-email">
                <Input
                id="member-email"
                type="email"
                value={values.email}
                onChange={(event) => updateValue("email", event.target.value)}
                placeholder="member@example.com"
                />
            </Field>

            <Field label="Gender" htmlFor="member-gender" required>
                <Select
                id="member-gender"
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

            <Field label="Assigned trainer" htmlFor="member-trainer">
                <Select
                id="member-trainer"
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
            </div>
        </section>

        <section className="space-y-4 border-t border-border pt-5">
            <h3 className="text-sm font-bold text-primary">Membership</h3>

            <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Membership plan" htmlFor="member-plan" required>
                <Select
                id="member-plan"
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

            <Field label="Start date" htmlFor="membership-start" required>
                <Input
                id="membership-start"
                type="date"
                value={values.membershipStartDate}
                onChange={(event) => handleStartDateChange(event.target.value)}
                />
            </Field>

            <Field label="End date" htmlFor="membership-end" required>
                <Input
                id="membership-end"
                type="date"
                value={values.membershipEndDate}
                onChange={(event) =>
                    updateValue("membershipEndDate", event.target.value)
                }
                />
            </Field>
            </div>
        </section>

        <section className="space-y-4 border-t border-border pt-5">
            <h3 className="text-sm font-bold text-primary">Contact and notes</h3>

            <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Emergency contact name" htmlFor="emergency-name">
                <Input
                id="emergency-name"
                value={values.emergencyContactName}
                onChange={(event) =>
                    updateValue("emergencyContactName", event.target.value)
                }
                />
            </Field>

            <Field label="Emergency contact mobile" htmlFor="emergency-mobile">
                <Input
                id="emergency-mobile"
                inputMode="numeric"
                maxLength={10}
                value={values.emergencyContactMobile}
                onChange={(event) =>
                    updateValue(
                    "emergencyContactMobile",
                    event.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                }
                />
            </Field>
            </div>

            <Field label="Address" htmlFor="member-address">
            <Textarea
                id="member-address"
                className="min-h-20"
                value={values.address}
                onChange={(event) => updateValue("address", event.target.value)}
                placeholder="Optional address"
            />
            </Field>

            <Field label="Notes" htmlFor="member-notes">
            <Textarea
                id="member-notes"
                className="min-h-20"
                value={values.notes}
                onChange={(event) => updateValue("notes", event.target.value)}
                placeholder="Training goals, medical notes, or front-desk instructions"
            />
            </Field>
        </section>

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
            <Button type="submit">
            {member ? "Save changes" : "Create member"}
            </Button>
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