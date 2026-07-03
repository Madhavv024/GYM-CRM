import { Bell, CalendarDays, CheckCheck, ChevronDown, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { getMemberFullName, getMembershipStatus } from "@/features/members/members.utils";
import { useMembersStore } from "@/features/members/members.store";
import { useMemo, useState } from "react";

interface TopbarProps {
    onMenuClick: () => void;
}

function getFormattedToday(): string {
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date());
}

export function Topbar({ onMenuClick }: TopbarProps) {
    const formattedToday = getFormattedToday();

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [dismissedNotificationIds, setDismissedNotificationIds] = useState<
        string[]
    >([]);
    const members = useMembersStore((state) => state.members);

    const notifications = useMemo(() => {

        return members
            .map((member) => {
                const status = getMembershipStatus(member);
                const endDate = parseISO(member.membershipEndDate);

                if (status === "expired") {
                    return {
                        id: `expired-${member.id}`,
                        title: "Membership expired",
                        description: `${getMemberFullName(member)} requires renewal follow-up.`,
                        timestamp: endDate,
                        tone: "danger" as const,
                    };
                }

                if (status === "expiring_soon") {
                    return {
                        id: `renewal-${member.id}`,
                        title: "Renewal due soon",
                        description: `${getMemberFullName(member)} expires shortly.`,
                        timestamp: endDate,
                        tone: "warning" as const,
                    };
                }

                return null;
            })
            .filter(
                (
                    notification,
                ): notification is {
                    id: string;
                    title: string;
                    description: string;
                    timestamp: Date;
                    tone: "danger" | "warning";
                } =>
                    notification !== null &&
                    !dismissedNotificationIds.includes(notification.id),
            )
            .filter(
                (notification) =>
                    notification !== null &&
                    !dismissedNotificationIds.includes(notification.id),
            )
            .sort(
                (firstNotification, secondNotification) =>
                    firstNotification.timestamp.getTime() -
                    secondNotification.timestamp.getTime(),
            )
            .slice(0, 6)
            .map((notification) => ({
                ...notification,
                relativeTime: formatDistanceToNowStrict(notification.timestamp, {
                    addSuffix: true,
                }),
            }));
    }, [dismissedNotificationIds, members]);

    const unreadNotificationCount = notifications.length;

    return (
        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-border bg-card px-4 shadow-[0_2px_10px_rgb(0_0_0_/_3%)] sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    aria-label="Toggle navigation menu"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_5px_14px_rgb(217_12_19_/_24%)] transition-transform hover:scale-105 hover:bg-primary/90"
                    onClick={onMenuClick}
                    type="button"
                >
                    <Menu className="size-5" strokeWidth={2.2} />
                </button>

                <div className="min-w-0">
                    <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
                        Welcome back, <span className="text-primary">Admin!</span>
                    </h1>
                    <p className="hidden text-sm text-muted-foreground sm:block">
                        Here&apos;s what&apos;s happening at{" "}
                        <span className="font-medium text-primary">SK Fitness</span> today.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
                <div className="hidden items-center gap-2 text-sm text-foreground md:flex">
                    <CalendarDays className="size-4 text-foreground" strokeWidth={2} />
                    <span className="font-medium">{formattedToday}</span>
                </div>

                <div className="relative hidden md:block">
                    <Button
                        aria-expanded={isNotificationsOpen}
                        aria-haspopup="dialog"
                        aria-label="Open notifications"
                        className="relative"
                        onClick={() => setIsNotificationsOpen((isOpen) => !isOpen)}
                        size="icon"
                        type="button"
                        variant="ghost"
                    >
                        <Bell className="size-[18px]" strokeWidth={2} />

                        {unreadNotificationCount > 0 ? (
                            <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                                {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                            </span>
                        ) : null}
                    </Button>

                    {isNotificationsOpen ? (
                        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-[0_18px_42px_rgb(0_0_0_/_16%)]">
                            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                                <div>
                                    <p className="text-sm font-bold text-foreground">Notifications</p>
                                    <p className="text-xs text-muted-foreground">
                                        Membership renewal alerts
                                    </p>
                                </div>

                                <CheckCheck className="size-4 text-primary" />
                            </div>

                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <Bell className="mx-auto size-5 text-muted-foreground" />
                                    <p className="mt-2 text-sm font-medium text-foreground">
                                        No notifications
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Renewals and expired memberships will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="max-h-80 divide-y divide-border overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
                                            onClick={() => {
                                                setDismissedNotificationIds((currentIds) => [
                                                    ...currentIds,
                                                    notification.id,
                                                ]);
                                            }}
                                            type="button"
                                        >
                                            <span
                                                className={
                                                    notification.tone === "danger"
                                                        ? "mt-1.5 size-2 shrink-0 rounded-full bg-danger"
                                                        : "mt-1.5 size-2 shrink-0 rounded-full bg-warning"
                                                }
                                            />

                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-foreground">
                                                    {notification.title}
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                    {notification.description}
                                                </p>
                                                <p className="mt-1 text-[11px] font-medium text-primary">
                                                    {notification.relativeTime}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                <div className="flex items-center gap-2 border-l border-border pl-3 sm:pl-5">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#171717] text-xs font-black text-white">
                        AD
                    </div>

                    <div className="hidden leading-tight sm:block">
                        <p className="text-sm font-bold text-foreground">Admin</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Owner</p>
                    </div>

                    <ChevronDown
                        className="hidden size-4 text-foreground sm:block"
                        strokeWidth={2}
                    />
                </div>
            </div>
        </header>
    );
}