import { format, parseISO } from "date-fns";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import type { Payment } from "@/types";

export function formatPaymentDate(date: string) {
  return format(parseISO(date), "dd MMM yyyy");
}

export function getPaymentMethodLabel(method: Payment["method"]) {
  return PAYMENT_METHOD_LABELS[method];
}

export function getPaymentStatusLabel(status: Payment["status"]) {
  return PAYMENT_STATUS_LABELS[status];
}

export function getSuccessfulPaymentTotal(payments: Payment[]) {
  return payments
    .filter((payment) => payment.status === "successful")
    .reduce((total, payment) => total + payment.amount, 0);
}

export function getPartialPaymentTotal(payments: Payment[]) {
  return payments
    .filter((payment) => payment.status === "partial")
    .reduce((total, payment) => total + payment.amount, 0);
}

export function getPaymentsForMember(payments: Payment[], memberId: string) {
  return payments.filter((payment) => payment.memberId === memberId);
}