import { CreditCard, MoreHorizontal, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PlanFormDialog } from "@/components/plans/plan-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { usePlansStore } from "@/features/plans/plans.store";
import {
    formatIndianCurrency,
    formatPlanDuration,
    getPlanStatusLabel,
    getPlanTotalPrice,
} from "@/features/plans/plans.utils";
import { cn } from "@/lib/utils";
import type { MembershipPlan } from "@/types";

interface PlanRowProps {
    plan: MembershipPlan;
}

function PlanRow({ plan }: PlanRowProps) {
    const deletePlan = usePlansStore((state) => state.deletePlan);
    const togglePlanStatus = usePlansStore((state) => state.togglePlanStatus);

    function handleStatusToggle() {
        togglePlanStatus(plan.id);

        toast.success(
            plan.isActive
                ? `${plan.name} has been deactivated.`
                : `${plan.name} has been activated.`,
        );
    }

    function handleDelete() {
        deletePlan(plan.id);
        toast.success(`${plan.name} has been deleted.`);
    }

    return (
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <CreditCard className="size-5" />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-card-foreground">
                                {plan.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {formatPlanDuration(plan.durationInDays)}
                            </p>
                        </div>

                        <Badge
                            className={cn(
                                "border",
                                plan.isActive
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-border bg-muted text-muted-foreground",
                            )}
                        >
                            {getPlanStatusLabel(plan.isActive)}
                        </Badge>
                    </div>

                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        {plan.description || "No plan description has been added."}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-border bg-background/40 px-3 py-2.5">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Membership fee
                            </p>
                            <p className="mt-1 text-sm font-semibold text-card-foreground">
                                {formatIndianCurrency(plan.price)}
                            </p>
                        </div>

                        <div className="rounded-lg border border-border bg-background/40 px-3 py-2.5">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Joining fee
                            </p>
                            <p className="mt-1 text-sm font-semibold text-card-foreground">
                                {formatIndianCurrency(plan.joiningFee)}
                            </p>
                        </div>

                        <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                First payment
                            </p>
                            <p className="mt-1 text-sm font-semibold text-primary">
                                {formatIndianCurrency(getPlanTotalPrice(plan))}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <PlanFormDialog
                        plan={plan}
                        triggerClassName="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    />

                    <Button
                        className="gap-2"
                        onClick={handleStatusToggle}
                        type="button"
                        variant="outline"
                    >
                        <Power className="size-4" />
                        {plan.isActive ? "Deactivate" : "Activate"}
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                aria-label={`Delete ${plan.name}`}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                size="icon"
                                type="button"
                                variant="ghost"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="border-border bg-card text-card-foreground">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete membership plan?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the {plan.name} plan. Existing
                                    member records will not be changed.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={handleDelete}
                                >
                                    Delete Plan
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </article>
    );
}

export function PlansPage() {
    const plans = usePlansStore((state) => state.plans);

    const activePlansCount = plans.filter((plan) => plan.isActive).length;

    return (
        <div className="space-y-6">
            <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-primary">SK FITNESS</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground">
                        Membership Plans
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Configure durations, pricing, joining fees, and plan availability.
                    </p>
                </div>

                <PlanFormDialog />
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <p className="text-sm text-muted-foreground">Total plans</p>
                    <p className="mt-2 text-3xl font-semibold text-card-foreground">
                        {plans.length}
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <p className="text-sm text-muted-foreground">Active plans</p>
                    <p className="mt-2 text-3xl font-semibold text-primary">
                        {activePlansCount}
                    </p>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            Plan catalogue
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Active plans can be used when creating or renewing memberships.
                        </p>
                    </div>

                    <MoreHorizontal className="size-5 text-muted-foreground" />
                </div>

                {plans.length === 0 ? (
                    <EmptyState
                        action={<PlanFormDialog />}
                        description="Create your first plan to start assigning memberships."
                        icon={<CreditCard className="size-5" />}
                        title="No membership plans yet"
                    />
                ) : (
                    <div className="space-y-4">
                        {plans.map((plan) => (
                            <PlanRow key={plan.id} plan={plan} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}