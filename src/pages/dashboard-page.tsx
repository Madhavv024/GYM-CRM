import { useMemo, useState, type ReactNode } from "react";
import {
    ArrowUpRight,
    CalendarDays,
    CircleDollarSign,
    Clock3,
    IndianRupee,
    Plus,
    UserRoundCheck,
    UserRoundPlus,
    Users,
    WalletCards,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
    format,
    isSameMonth,
    isWithinInterval,
    parseISO,
    startOfDay,
    subMonths,
} from "date-fns";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MembershipStatusBadge } from "@/components/shared/status-badge";
import { useMembersStore } from "@/features/members/members.store";
import {
    formatCurrency,
    formatMemberDate,
    getMemberFullName,
    getMembershipStatus,
} from "@/features/members/members.utils";
import { usePaymentsStore } from "@/features/payments/payments.store";
import { formatPaymentDate } from "@/features/payments/payments.utils";
import { useAppointmentsStore } from "@/features/appointments/appointments.store";
import {
    formatAppointmentTimeRange,
    getAppointmentStatusLabel,
    getTodayAppointments,
} from "@/features/appointments/appointments.utils";
import type { Member, Payment, Appointment } from "@/types";

const chartGridLines = [0, 25, 50, 75, 100];

export function DashboardPage() {
    const navigate = useNavigate();
    const members = useMembersStore((state) => state.members);
    const payments = usePaymentsStore((state) => state.payments);
    const appointments = useAppointmentsStore((state) => state.appointments);
    const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("last_6_months");

    type RevenuePeriod = "this_month" | "last_month" | "last_3_months" | "last_6_months";

    const revenuePeriodOptions: Array<{
        label: string;
        value: RevenuePeriod;
    }> = [
            { label: "This Month", value: "this_month" },
            { label: "Last Month", value: "last_month" },
            { label: "Last 3 Months", value: "last_3_months" },
            { label: "Last 6 Months", value: "last_6_months" },
        ];

    const metrics = useMemo(() => {
        const today = startOfDay(new Date());

        const activeMembers = members.filter(
            (member) => getMembershipStatus(member) === "active",
        ).length;

        const renewalsDue = members.filter((member) => {
            const status = getMembershipStatus(member);

            return status === "expiring_soon";
        }).length;

        const currentMonthRevenue = payments
            .filter(
                (payment) =>
                    payment.status === "successful" &&
                    isSameMonth(parseISO(payment.paymentDate), today),
            )
            .reduce((total, payment) => total + payment.amount, 0);

        const pendingDues = payments
            .filter((payment) => payment.status !== "successful")
            .reduce((total, payment) => total + payment.amount, 0);

        return {
            activeMembers,
            currentMonthRevenue,
            pendingDues,
            renewalsDue,
            totalMembers: members.length,
        };
    }, [members, payments]);

    const membershipStatusData = useMemo(() => {
        const statuses = [
            { label: "Active", status: "active" as const, colorClass: "bg-primary" },
            {
                label: "Expiring Soon",
                status: "expiring_soon" as const,
                colorClass: "bg-[#ff5149]",
            },
            { label: "Expired", status: "expired" as const, colorClass: "bg-[#181818]" },
            { label: "Paused", status: "paused" as const, colorClass: "bg-[#8b8b8b]" },
        ];

        return statuses.map((item) => {
            const count = members.filter(
                (member) => getMembershipStatus(member) === item.status,
            ).length;

            return {
                ...item,
                count,
                percentage:
                    metrics.totalMembers === 0
                        ? 0
                        : Math.round((count / metrics.totalMembers) * 100),
            };
        });
    }, [members, metrics.totalMembers]);

    const recentPayments = useMemo(
        () =>
            [...payments]
                .sort(
                    (firstPayment, secondPayment) =>
                        parseISO(secondPayment.paymentDate).getTime() -
                        parseISO(firstPayment.paymentDate).getTime(),
                )
                .slice(0, 4),
        [payments],
    );

    const todayAppointments = useMemo(
        () =>
            getTodayAppointments(appointments)
                .filter((appointment) => appointment.status === "scheduled")
                .slice(0, 4),
        [appointments],
    );

    const renewalQueue = useMemo(() => {
        const today = startOfDay(new Date());
        const nextSevenDays = new Date(today);
        nextSevenDays.setDate(today.getDate() + 7);

        return members
            .filter((member) =>
                isWithinInterval(parseISO(member.membershipEndDate), {
                    end: nextSevenDays,
                    start: today,
                }),
            )
            .sort(
                (firstMember, secondMember) =>
                    parseISO(firstMember.membershipEndDate).getTime() -
                    parseISO(secondMember.membershipEndDate).getTime(),
            )
            .slice(0, 4);
    }, [members]);

    const revenueTrend = useMemo(() => {
        const today = new Date();

        const periodConfig: Record<
            RevenuePeriod,
            {
                monthCount: number;
                startOffset: number;
            }
        > = {
            this_month: {
                monthCount: 1,
                startOffset: 0,
            },
            last_month: {
                monthCount: 1,
                startOffset: 1,
            },
            last_3_months: {
                monthCount: 3,
                startOffset: 2,
            },
            last_6_months: {
                monthCount: 6,
                startOffset: 5,
            },
        };

        const { monthCount, startOffset } = periodConfig[revenuePeriod];

        return Array.from({ length: monthCount }, (_, index) => {
            const monthDate = subMonths(today, startOffset - index);

            const total = payments
                .filter(
                    (payment) =>
                        payment.status === "successful" &&
                        isSameMonth(parseISO(payment.paymentDate), monthDate),
                )
                .reduce((sum, payment) => sum + payment.amount, 0);

            return {
                label:
                    revenuePeriod === "this_month" || revenuePeriod === "last_month"
                        ? format(monthDate, "MMM yyyy")
                        : format(monthDate, "MMM"),
                total,
            };
        });
    }, [payments, revenuePeriod]);

    const maximumRevenue = Math.max(
        ...revenueTrend.map((month) => month.total),
        1,
    );

    return (
        <div className="space-y-5">
            <PageHeader
                title="Performance Dashboard"
                description="Monitor member health, collections, and front-desk activity."
                actions={
                    <Button onClick={() => navigate("/members")}>
                        <Plus className="size-4" />
                        Add Member
                    </Button>
                }
            />

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    detail={`${metrics.totalMembers} registered members`}
                    icon={<Users className="size-7" strokeWidth={2.2} />}
                    label="Total Members"
                    value={String(metrics.totalMembers)}
                />
                <MetricCard
                    detail={`${metrics.renewalsDue} renewals due this week`}
                    icon={<UserRoundCheck className="size-7" strokeWidth={2.2} />}
                    label="Active Members"
                    value={String(metrics.activeMembers)}
                />
                <MetricCard
                    detail="Successful payments this month"
                    icon={<IndianRupee className="size-7" strokeWidth={2.2} />}
                    label="Monthly Collection"
                    value={formatCurrency(metrics.currentMonthRevenue)}
                />
                <MetricCard
                    detail="Outstanding amount from active records"
                    icon={<WalletCards className="size-7" strokeWidth={2.2} />}
                    label="Pending Dues"
                    value={formatCurrency(metrics.pendingDues)}
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)_minmax(260px,0.62fr)]">
                <article className="rounded-xl border border-border bg-card p-5 shadow-[0_3px_14px_rgb(0_0_0_/_4%)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-foreground">
                                Monthly Collection Overview
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Successful collections over the last six months.
                            </p>
                        </div>
                        <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
                            <CalendarDays className="size-3.5" />

                            <select
                                aria-label="Select collection chart period"
                                className="cursor-pointer appearance-none bg-transparent pr-1 font-medium text-foreground outline-none"
                                onChange={(event) =>
                                    setRevenuePeriod(event.target.value as RevenuePeriod)
                                }
                                value={revenuePeriod}
                            >
                                {revenuePeriodOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="mt-6 grid h-64 grid-cols-[56px_minmax(0,1fr)] gap-3">
                        <div className="flex flex-col justify-between pb-6 text-[10px] font-medium text-muted-foreground">
                            {chartGridLines
                                .slice()
                                .reverse()
                                .map((line) => (
                                    <span key={line}>
                                        {formatCurrency(Math.round((maximumRevenue * line) / 100))}
                                    </span>
                                ))}
                        </div>

                        <div
                            className="relative grid items-end gap-4 border-b border-border pb-6"
                            style={{
                                gridTemplateColumns: `repeat(${revenueTrend.length}, minmax(0, 1fr))`,
                            }}
                        >
                            <div className="pointer-events-none absolute inset-x-0 inset-y-0 flex flex-col justify-between">
                                {chartGridLines.map((line) => (
                                    <div key={line} className="border-t border-border/70" />
                                ))}
                            </div>

                            {revenueTrend.map((month) => {
                                const height = Math.max(
                                    (month.total / maximumRevenue) * 100,
                                    month.total > 0 ? 8 : 2,
                                );

                                return (
                                    <div
                                        key={month.label}
                                        className="relative z-10 flex h-full flex-col justify-end gap-2"
                                    >
                                        <p className="whitespace-nowrap text-center text-[10px] font-bold text-foreground">
                                            {month.total > 0 ? formatCurrency(month.total) : "—"}
                                        </p>
                                        <div className="flex h-[190px] items-end justify-center">
                                            <div
                                                className="w-full max-w-10 rounded-t-md bg-linear-to-b from-[#ff4a4a] to-primary shadow-[0_5px_12px_rgb(217_12_19_/_18%)]"
                                                style={{ height: `${height}%` }}
                                                title={`${month.label}: ${formatCurrency(month.total)}`}
                                            />
                                        </div>
                                        <p className="text-center text-xs font-medium text-muted-foreground">
                                            {month.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </article>

                <article className="rounded-xl border border-border bg-card p-5 shadow-[0_3px_14px_rgb(0_0_0_/_4%)]">
                    <h2 className="text-base font-bold text-foreground">
                        Membership Status
                    </h2>

                    <div className="mt-7 flex items-center gap-5">
                        <div
                            className="relative flex size-36 shrink-0 items-center justify-center rounded-full"
                            style={{
                                background: `conic-gradient(
                  #d90c13 0deg ${membershipStatusData[0].percentage * 3.6}deg,
                  #ff5149 ${membershipStatusData[0].percentage * 3.6}deg ${(membershipStatusData[0].percentage + membershipStatusData[1].percentage) * 3.6}deg,
                  #181818 ${(membershipStatusData[0].percentage + membershipStatusData[1].percentage) * 3.6}deg ${(membershipStatusData[0].percentage + membershipStatusData[1].percentage + membershipStatusData[2].percentage) * 3.6}deg,
                  #8b8b8b ${(membershipStatusData[0].percentage + membershipStatusData[1].percentage + membershipStatusData[2].percentage) * 3.6}deg 360deg
                )`,
                            }}
                        >
                            <div className="flex size-24 flex-col items-center justify-center rounded-full bg-card">
                                <span className="text-2xl font-black text-foreground">
                                    {metrics.totalMembers}
                                </span>
                                <span className="text-xs text-muted-foreground">Total</span>
                            </div>
                        </div>

                        <div className="min-w-0 space-y-3">
                            {membershipStatusData.map((item) => (
                                <div key={item.label} className="flex items-start gap-2">
                                    <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${item.colorClass}`} />
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.count} ({item.percentage}%)
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </article>

                <div className="space-y-4">
                    <article className="rounded-xl border border-border bg-card p-5 shadow-[0_3px_14px_rgb(0_0_0_/_4%)]">
                        <h2 className="text-base font-bold text-foreground">Renewals Due</h2>

                        <div className="mt-5 flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <ArrowUpRight className="size-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-foreground">
                                    {renewalQueue.length}
                                </p>
                                <p className="text-sm text-muted-foreground">Members</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-xs font-medium text-primary">in next 7 days</p>
                            <Button
                                onClick={() => navigate("/members")}
                                size="sm"
                                variant="outline"
                            >
                                View All
                            </Button>
                        </div>
                    </article>

                    <DashboardPanel
                        actionLabel="View All Payments"
                        actionTo="/payments"
                        description="Latest successful and pending records."
                        title="Latest Payments"
                    >
                        {recentPayments.length === 0 ? (
                            <p className="py-7 text-center text-sm text-muted-foreground">
                                No payments recorded yet.
                            </p>
                        ) : (
                            <div className="max-h-[92px] divide-y divide-border overflow-y-auto pr-1">
                                {recentPayments.map((payment) => (
                                    <RecentPaymentItem
                                        key={payment.id}
                                        members={members}
                                        payment={payment}
                                    />
                                ))}
                            </div>
                        )}
                    </DashboardPanel>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)_300px]">
                <DashboardPanel
                    actionLabel="View Members"
                    actionTo="/members"
                    description="Members that need membership follow-up."
                    title="Renewal Queue"
                >
                    {renewalQueue.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No memberships require immediate follow-up.
                        </p>
                    ) : (
                        <div className="max-h-[280px] divide-y divide-border overflow-y-auto pr-2">
                            {renewalQueue.map((member) => (
                                <RenewalQueueItem key={member.id} member={member} />
                            ))}
                        </div>
                    )}
                </DashboardPanel>

                <DashboardPanel
                    actionLabel="View Schedule"
                    actionTo="/appointments"
                    description="Scheduled front-desk appointments for today."
                    title="Today's Appointments"
                >
                    {todayAppointments.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No scheduled appointments today.
                        </p>
                    ) : (
                        <div className="max-h-[280px] divide-y divide-border overflow-y-auto pr-2">
                            {todayAppointments.map((appointment) => (
                                <TodayAppointmentItem key={appointment.id} appointment={appointment} />
                            ))}
                        </div>
                    )}
                </DashboardPanel>

                <article className="rounded-xl border border-border bg-card p-5 shadow-[0_3px_14px_rgb(0_0_0_/_4%)]">
                    <h2 className="text-base font-bold text-foreground">Quick Actions</h2>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <QuickAction
                            icon={<UserRoundPlus className="size-5" />}
                            label="Add Lead"
                            onClick={() => navigate("/leads")}
                        />
                        <QuickAction
                            icon={<CalendarDays className="size-5" />}
                            label="Appointments"
                            onClick={() => navigate("/appointments")}
                        />
                        <QuickAction
                            icon={<Users className="size-5" />}
                            label="Add Member"
                            onClick={() => navigate("/members")}
                        />
                        <QuickAction
                            icon={<IndianRupee className="size-5" />}
                            label="Receive Payment"
                            onClick={() => navigate("/payments")}
                        />
                        <QuickAction
                            icon={<CircleDollarSign className="size-5" />}
                            label="Add Expense"
                            onClick={() => navigate("/expenses")}
                        />
                    </div>
                </article>
            </section>
        </div>
    );
}

function MetricCard({
    label,
    value,
    detail,
    icon,
}: {
    label: string;
    value: string;
    detail: string;
    icon: ReactNode;
}) {
    return (
        <article className="rounded-xl border border-border bg-card p-5 shadow-[0_3px_14px_rgb(0_0_0_/_4%)]">
            <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {icon}
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="mt-1 truncate text-2xl font-black tracking-tight text-foreground">
                        {value}
                    </p>
                </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{detail}</p>
        </article>
    );
}

function DashboardPanel({
    title,
    description,
    actionLabel,
    actionTo,
    children,
}: {
    title: string;
    description: string;
    actionLabel: string;
    actionTo: string;
    children: ReactNode;
}) {
    return (
        <article className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_3px_14px_rgb(0_0_0_/_4%)]">
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                    <h2 className="text-base font-bold text-foreground">{title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>
                <Link
                    className="shrink-0 text-xs font-bold text-primary hover:opacity-75"
                    to={actionTo}
                >
                    {actionLabel} <span aria-hidden="true">›</span>
                </Link>
            </div>
            <div className="px-5">{children}</div>
        </article>
    );
}

function QuickAction({
    icon,
    label,
    onClick,
}: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background text-xs font-semibold text-foreground transition-colors hover:border-primary/35 hover:bg-primary/5"
            onClick={onClick}
            type="button"
        >
            <span className="text-primary">{icon}</span>
            {label}
        </button>
    );
}

function RenewalQueueItem({ member }: { member: Member }) {
    const status = getMembershipStatus(member);

    return (
        <Link
            className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-muted/50"
            to={`/members/${member.id}`}
        >
            <div>
                <p className="font-semibold text-foreground">
                    {getMemberFullName(member)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {member.memberCode} · Ends {formatMemberDate(member.membershipEndDate)}
                </p>
            </div>
            <MembershipStatusBadge status={status} />
        </Link>
    );
}

function TodayAppointmentItem({
    appointment,
}: {
    appointment: Appointment;
}) {
    return (
        <Link
            className="flex items-center justify-between gap-3 py-4 transition-colors hover:bg-muted/50"
            to="/appointments"
        >
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                    {appointment.title}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    {formatAppointmentTimeRange(
                        appointment.startTime,
                        appointment.endTime,
                    )}
                </p>
            </div>

            <Badge variant="info">{getAppointmentStatusLabel(appointment.status)}</Badge>
        </Link>
    );
}

function RecentPaymentItem({
    payment,
    members,
}: {
    payment: Payment;
    members: Member[];
}) {
    const member = members.find((item) => item.id === payment.memberId);
    const memberName = member ? getMemberFullName(member) : "Deleted member";

    return (
        <Link
            className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-muted/50"
            to="/payments"
        >
            <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                    {memberName}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatPaymentDate(payment.paymentDate)}
                </p>
            </div>
            <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                    {formatCurrency(payment.amount)}
                </p>
                <Badge variant={payment.status === "successful" ? "success" : "warning"}>
                    {payment.status}
                </Badge>
            </div>
        </Link>
    );
}