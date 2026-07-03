import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePaymentsStore } from "@/features/payments/payments.store";
import {
    formatPaymentDate,
    getPaymentMethodLabel,
    getPaymentStatusLabel,
} from "@/features/payments/payments.utils";
import type { Member, Payment } from "@/types";
import {
    ArrowLeft,
    CalendarDays,
    // Dumbbell,
    Edit3,
    Mail,
    MapPin,
    Pause,
    Phone,
    Play,
    ReceiptText,
    Trash2,
    UserRound,
    UsersRound,
} from "lucide-react";
import { RenewMembershipDialog } from "@/components/members/renew-membership-dialog";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { MemberFormDialog } from "@/features/members/member-form-dialog";
// import { MemberRenewalDialog } from "@/features/members/member-renewal-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { MembershipStatusBadge } from "@/components/shared/status-badge";
import { useMembersStore } from "@/features/members/members.store";
import {
    formatCurrency,
    formatMemberDate,
    getMemberFullName,
    getMemberInitials,
    // getMembershipDaysRemaining,
    getMembershipStatus,
} from "@/features/members/members.utils";
// import { usePlansStore } from "@/features/plans/plans.store";
import { useTrainersStore } from "@/features/trainers/trainers.store";
import { cn } from "@/lib/utils";

export function MemberDetailsPage() {
    const { memberId } = useParams();
    const navigate = useNavigate();

    const members = useMembersStore((state) => state.members);
    const deleteMember = useMembersStore((state) => state.deleteMember);
    const pauseMembership = useMembersStore((state) => state.pauseMembership);
    const resumeMembership = useMembersStore((state) => state.resumeMembership);
    // const plans = usePlansStore((state) => state.plans);
    const trainers = useTrainersStore((state) => state.trainers);
    const payments = usePaymentsStore((state) => state.payments);

    const member = members.find((item) => item.id === memberId);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isRenewalOpen, setIsRenewalOpen] = useState(false);
    const [isPauseOpen, setIsPauseOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // const currentPlan = useMemo(
    //     () => plans.find((plan) => plan.id === member?.planId),
    //     [member?.planId, plans],
    // );

    const assignedTrainer = useMemo(
        () => trainers.find((trainer) => trainer.id === member?.assignedTrainerId),
        [member?.assignedTrainerId, trainers],
    );

    const memberPayments = useMemo(
        () =>
            payments
                .filter((payment) => payment.memberId === member?.id)
                .sort(
                    (firstPayment, secondPayment) =>
                        new Date(secondPayment.paymentDate).getTime() -
                        new Date(firstPayment.paymentDate).getTime(),
                ),
        [member?.id, payments],
    );

    if (!member) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Member not found"
                    description="This profile may have been deleted or the link is invalid."
                    actions={
                        <Button variant="outline" onClick={() => navigate("/members")}>
                            <ArrowLeft className="size-4" />
                            Back to members
                        </Button>
                    }
                />
                <EmptyState
                    icon={<UsersRound className="size-5" />}
                    title="Member record unavailable"
                    description="Return to the member directory and select an active member profile."
                    action={
                        <Button onClick={() => navigate("/members")}>
                            View members
                        </Button>
                    }
                />
            </div>
        );
    }

    const membershipStatus = getMembershipStatus(member);
    // const daysRemaining = getMembershipDaysRemaining(member.membershipEndDate);

    function handlePauseMembership(reason: string) {
        if (!member) {
            return;
        }

        const memberName = getMemberFullName(member);

        pauseMembership(member.id, { reason });
        toast.success(`${memberName}'s membership was paused.`);
        setIsPauseOpen(false);
    }

    function handleResumeMembership() {
        if (!member) {
            return;
        }

        const memberName = getMemberFullName(member);

        resumeMembership(member.id);
        toast.success(`${memberName}'s membership was resumed.`);
    }


    function handleDeleteMember() {
        if (!member) {
            return;
        }

        const deletedMemberName = getMemberFullName(member);

        deleteMember(member.id);
        toast.success(`${deletedMemberName} was removed.`);
        navigate("/members");
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={getMemberFullName(member)}
                description={`${member.memberCode} · Joined ${formatMemberDate(member.joinedAt)}`}
                actions={
                    <>
                        <Link
                            to="/members"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-transparent px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                        >
                            <ArrowLeft className="size-4" />
                            Back
                        </Link>
                        <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                            <Edit3 className="size-4" />
                            Edit
                        </Button>
                    </>
                }
            />

            <section className="glass-surface overflow-hidden rounded-lg border border-border">
                <div className="grid gap-6 p-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:p-6">
                    <MemberAvatar member={member} size="lg" />

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-black tracking-tight text-foreground">
                                {getMemberFullName(member)}
                            </h2>
                            <MembershipStatusBadge status={membershipStatus} />
                        </div>

                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
                            <ProfileMeta icon={<Phone className="size-4" />} label={member.mobile} />
                            <ProfileMeta
                                icon={<Mail className="size-4" />}
                                label={member.email ?? "No email added"}
                            />
                            <ProfileMeta
                                icon={<CalendarDays className="size-4" />}
                                label={`Ends ${formatMemberDate(member.membershipEndDate)}`}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                        <Button onClick={() => setIsRenewalOpen(true)}>
                            <CalendarDays className="size-4" />
                            Renew membership
                        </Button>

                        {member.isPaused ? (
                            <Button variant="outline" onClick={handleResumeMembership}>
                                <Play className="size-4" />
                                Resume membership
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={() => setIsPauseOpen(true)}>
                                <Pause className="size-4" />
                                Pause membership
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                <div className="space-y-6">
                    <section className="solid-surface rounded-lg border border-border">
                        <SectionHeader
                            title="Payment history"
                            description="Recorded collections for this member."
                            icon={<ReceiptText className="size-4" />}
                        />

                        {memberPayments.length === 0 ? (
                            <div className="grid gap-4 p-5 sm:grid-cols-2">
                                <PlaceholderMetric
                                    label="Payment activity"
                                    value="No payments"
                                    description="No collection records have been added for this member."
                                />
                                {/* <PlaceholderMetric
                                    label="Attendance activity"
                                    value="Coming next"
                                    description="Check-ins and visit frequency."
                                /> */}
                            </div>
                        ) : (
                            <>
                                <div className="divide-y divide-border">
                                    {memberPayments.map((payment) => (
                                        <MemberPaymentRow key={payment.id} payment={payment} />
                                    ))}
                                </div>

                                <div className="border-t border-border bg-muted/15 p-5">
                                    {/* <PlaceholderMetric
                                        label="Attendance activity"
                                        value="Coming next"
                                        description="Check-ins and visit frequency."
                                    /> */}
                                </div>
                            </>
                        )}
                    </section>

                    <section className="solid-surface rounded-lg border border-border">
                        <SectionHeader
                            title="Renewal history"
                            description="Membership cycles recorded for this member."
                            icon={<CalendarDays className="size-4" />}
                        />

                        <div className="divide-y divide-border">
                            {[...member.membershipHistory]
                                .reverse()
                                .map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto]"
                                    >
                                        <div>
                                            <p className="font-semibold text-foreground">{entry.planName}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {formatMemberDate(entry.startDate)} — {formatMemberDate(entry.endDate)}
                                            </p>
                                            {entry.notes ? (
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {entry.notes}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="sm:text-right">
                                            <p className="font-bold text-primary">
                                                {formatCurrency(entry.price)}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Recorded {formatMemberDate(entry.renewedAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </section>

                    {
                        //     <section className="solid-surface rounded-lg border border-border">
                        //     <SectionHeader
                        //         title="Activity"
                        //         description="Payments and attendance will populate here when those modules are connected."
                        //         icon={<ReceiptText className="size-4" />}
                        //     />

                        //     <div className="grid gap-4 p-5 sm:grid-cols-2">
                        //         <PlaceholderMetric
                        //             label="Payment activity"
                        //             value="Coming next"
                        //             description="Payment ledger and pending dues."
                        //         />
                        //         <PlaceholderMetric
                        //             label="Attendance activity"
                        //             value="Coming next"
                        //             description="Check-ins and visit frequency."
                        //         />
                        //     </div>
                        // </section>
                    }
                </div>

                <aside className="space-y-6">
                    <section className="solid-surface rounded-lg border border-border">
                        <SectionHeader
                            title="Assigned trainer"
                            description="Primary coaching assignment."
                            icon={<UserRound className="size-4" />}
                        />

                        <div className="p-5">
                            {assignedTrainer ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-11 items-center justify-center rounded-md border border-primary/20 bg-primary/10 font-black text-primary">
                                            {assignedTrainer.fullName
                                                .split(" ")
                                                .map((part) => part.charAt(0))
                                                .join("")
                                                .slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">{assignedTrainer.fullName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {assignedTrainer.mobile}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {assignedTrainer.specialization.map((specialization) => (
                                            <span
                                                key={specialization}
                                                className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                                            >
                                                {specialization}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm leading-6 text-muted-foreground">
                                    No trainer is assigned to this member.
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="solid-surface rounded-lg border border-border">
                        <SectionHeader
                            title="Profile details"
                            description="Contact and front-desk information."
                            icon={<UserRound className="size-4" />}
                        />

                        <dl className="divide-y divide-border">
                            <DetailRow label="Gender" value={capitalize(member.gender)} />
                            <DetailRow
                                label="Date of birth"
                                value={member.dateOfBirth ? formatMemberDate(member.dateOfBirth) : "Not added"}
                            />
                            <DetailRow
                                label="Emergency contact"
                                value={
                                    member.emergencyContactName
                                        ? `${member.emergencyContactName}${member.emergencyContactMobile ? ` · ${member.emergencyContactMobile}` : ""}`
                                        : "Not added"
                                }
                            />
                            <DetailRow
                                label="Address"
                                value={member.address ?? "Not added"}
                                icon={<MapPin className="size-3.5" />}
                            />
                            <DetailRow label="Notes" value={member.notes ?? "No notes added"} />
                        </dl>
                    </section>

                    <section className="rounded-lg border border-danger/25 bg-danger/5 p-5">
                        <h3 className="font-bold text-foreground">Danger zone</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Permanently remove this member profile and its local membership history.
                        </p>
                        <Button
                            variant="ghost"
                            className="mt-4 w-full border border-danger/30 text-danger hover:bg-danger/10 hover:text-danger"
                            onClick={() => setIsDeleteOpen(true)}
                        >
                            <Trash2 className="size-4" />
                            Delete member
                        </Button>
                    </section>
                </aside>
            </div>

            <MemberFormDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                member={member}
            />

            <RenewMembershipDialog
                open={isRenewalOpen}
                onOpenChange={setIsRenewalOpen}
                member={member}
            />

            <PauseMembershipDialog
                open={isPauseOpen}
                onOpenChange={setIsPauseOpen}
                member={member}
                onConfirm={handlePauseMembership}
            />

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete member profile?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove {getMemberFullName(member)} and their
                            membership history from SK-Fitness CRM. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                            <Button variant="ghost">Cancel</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button
                                className="bg-danger text-white hover:bg-danger/90"
                                onClick={handleDeleteMember}
                            >
                                Delete member
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function PauseMembershipDialog({
    open,
    onOpenChange,
    member,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member;
    onConfirm: (reason: string) => void;
}) {
    const [reason, setReason] = useState("");

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedReason = reason.trim();

        if (!normalizedReason) {
            return;
        }

        onConfirm(normalizedReason);
        setReason("");
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pause membership</DialogTitle>
                    <DialogDescription>
                        Record why {getMemberFullName(member)}'s membership is being paused.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="pause-reason">Pause reason</Label>
                        <Textarea
                            id="pause-reason"
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="For example: medical recovery, travel, or temporary hold"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!reason.trim()}>
                            Pause membership
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function SectionHeader({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 border-b border-border px-5 py-4">
            <div className="mt-0.5 text-primary">{icon}</div>
            <div>
                <h2 className="font-bold text-foreground">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

function ProfileMeta({
    icon,
    label,
}: {
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
            <span className="shrink-0 text-primary">{icon}</span>
            <span className="truncate">{label}</span>
        </div>
    );
}

// function InfoCell({
//     label,
//     value,
//     valueClassName,
// }: {
//     label: string;
//     value: string;
//     valueClassName?: string;
// }) {
//     return (
//         <div className="p-5">
//             <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
//                 {label}
//             </p>
//             <p className={cn("mt-2 font-semibold text-foreground", valueClassName)}>
//                 {value}
//             </p>
//         </div>
//     );
// }

function DetailRow({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="px-5 py-4">
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-2 flex items-start gap-2 text-sm leading-6 text-foreground">
                {icon ? <span className="mt-1 shrink-0 text-primary">{icon}</span> : null}
                <span>{value}</span>
            </dd>
        </div>
    );
}

function MemberPaymentRow({ payment }: { payment: Payment }) {
    return (
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-foreground">{payment.receiptNumber}</p>
                    <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {getPaymentStatusLabel(payment.status)}
                    </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                    {formatPaymentDate(payment.paymentDate)} ·{" "}
                    {getPaymentMethodLabel(payment.method)}
                </p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
                <p className="font-bold text-foreground">
                    {formatCurrency(payment.amount)}
                </p>
                <Link
                    to={`/payments/${payment.id}/receipt`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                    View receipt
                </Link>
            </div>
        </div>
    );
}

function PlaceholderMetric({
    label,
    value,
    description,
}: {
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-md border border-border bg-muted/20 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
            </p>
            <p className="mt-3 text-lg font-black text-foreground">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function MemberAvatar({
    member,
    size,
}: {
    member: Member;
    size: "lg";
}) {
    return (
        <div
            className={cn(
                "flex shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 font-black text-primary",
                size === "lg" ? "size-20 text-xl" : "",
            )}
            aria-hidden="true"
        >
            {getMemberInitials(member)}
        </div>
    );
}

function capitalize(value: string) {
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}