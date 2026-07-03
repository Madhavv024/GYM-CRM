import {
  differenceInCalendarDays,
  format,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
import { CURRENCY_CODE, CURRENCY_LOCALE, MEMBERSHIP_EXPIRING_SOON_DAYS } from "@/lib/constants";
import type { Member, MembershipStatus, Payment } from "@/types";

export function getMemberFullName(member: Pick<Member, "firstName" | "lastName">) {
  return `${member.firstName} ${member.lastName}`.trim();
}

export function getMembershipStatus(
  member: Pick<Member, "membershipEndDate" | "isPaused">,
  expiringSoonDays = MEMBERSHIP_EXPIRING_SOON_DAYS,
): MembershipStatus {
  if (member.isPaused) {
    return "paused";
  }

  const today = startOfDay(new Date());
  const endDate = startOfDay(parseISO(member.membershipEndDate));

  if (isBefore(endDate, today)) {
    return "expired";
  }

  const daysRemaining = differenceInCalendarDays(endDate, today);

  if (daysRemaining <= expiringSoonDays) {
    return "expiring_soon";
  }

  return "active";
}

export function getMembershipDaysRemaining(endDate: string) {
  return differenceInCalendarDays(startOfDay(parseISO(endDate)), startOfDay(new Date()));
}

export function getSuccessfulPaymentsForMember(
  payments: Payment[],
  memberId: string,
) {
  return payments.filter(
    (payment) =>
      payment.memberId === memberId && payment.status === "successful",
  );
}

export function getTotalSuccessfulPayments(
  payments: Payment[],
  memberId: string,
) {
  return getSuccessfulPaymentsForMember(payments, memberId).reduce(
    (total, payment) => total + payment.amount,
    0,
  );
}

export function getPendingDues(
  planPrice: number,
  payments: Payment[],
  memberId: string,
) {
  const paidAmount = getTotalSuccessfulPayments(payments, memberId);
  return Math.max(planPrice - paidAmount, 0);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMemberDate(date: string) {
  return format(parseISO(date), "dd MMM yyyy");
}

export function getMemberInitials(
  member: Pick<Member, "firstName" | "lastName">,
) {
  return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
}