import type { MembershipPlan } from "@/types";

export function formatPlanDuration(durationInDays: number): string {
  if (durationInDays === 30) {
    return "1 Month";
  }

  if (durationInDays === 90) {
    return "3 Months";
  }

  if (durationInDays % 30 === 0) {
    const months = durationInDays / 30;

    return `${months} Months`;
  }

  return `${durationInDays} Days`;
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

export function getPlanTotalPrice(plan: MembershipPlan): number {
  return plan.price + plan.joiningFee;
}

export function getPlanStatusLabel(isActive: boolean): string {
  return isActive ? "Active" : "Inactive";
}