import {
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  getMembershipStatus,
  getPendingDues,
} from "@/features/members/members.utils";
import type { Lead, Member, Payment } from "@/types";

export interface MonthlyCollectionPoint {
  label: string;
  total: number;
}

export interface MembershipHealthSummary {
  active: number;
  expiringSoon: number;
  expired: number;
  paused: number;
}

export function getSuccessfulPayments(payments: Payment[]) {
  return payments.filter((payment) => payment.status === "successful");
}

export function getCurrentMonthCollections(payments: Payment[]) {
  const currentMonth = new Date();

  return getSuccessfulPayments(payments)
    .filter((payment) => isSameMonth(parseISO(payment.paymentDate), currentMonth))
    .reduce((total, payment) => total + payment.amount, 0);
}

export function getMonthlyCollectionTrend(
  payments: Payment[],
  monthCount = 6,
): MonthlyCollectionPoint[] {
  return Array.from({ length: monthCount }, (_, index) => {
    const monthDate = startOfMonth(subMonths(new Date(), monthCount - 1 - index));

    const total = getSuccessfulPayments(payments)
      .filter((payment) => isSameMonth(parseISO(payment.paymentDate), monthDate))
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      label: format(monthDate, "MMM"),
      total,
    };
  });
}

export function getMembershipHealthSummary(
  members: Member[],
): MembershipHealthSummary {
  return members.reduce<MembershipHealthSummary>(
    (summary, member) => {
      const status = getMembershipStatus(member);

      if (status === "active") {
        summary.active += 1;
      }

      if (status === "expiring_soon") {
        summary.expiringSoon += 1;
      }

      if (status === "expired") {
        summary.expired += 1;
      }

      if (status === "paused") {
        summary.paused += 1;
      }

      return summary;
    },
    {
      active: 0,
      expiringSoon: 0,
      expired: 0,
      paused: 0,
    },
  );
}

export function getRenewalsDueCount(members: Member[]) {
  return members.filter(
    (member) => getMembershipStatus(member) === "expiring_soon",
  ).length;
}

export function getTotalPendingDues(
  members: Member[],
  payments: Payment[],
  getPlanPrice: (planId: string) => number | undefined,
) {
  return members.reduce((total, member) => {
    const planPrice = getPlanPrice(member.planId);

    if (planPrice === undefined) {
      return total;
    }

    return total + getPendingDues(planPrice, payments, member.id);
  }, 0);
}

export function getLeadConversionSummary(leads: Lead[]) {
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(
    (lead) => lead.status === "converted",
  ).length;

  return {
    totalLeads,
    convertedLeads,
    conversionRate:
      totalLeads === 0 ? 0 : Math.round((convertedLeads / totalLeads) * 100),
  };
}