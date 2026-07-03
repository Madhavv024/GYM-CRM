import { getMemberFullName } from "@/features/members/members.utils";
import type { Member, Payment } from "@/types";

export type PaymentStatusFilter = Payment["status"] | "all";
export type PaymentMethodFilter = Payment["method"] | "all";

export interface PaymentFilters {
    query: string;
    status: PaymentStatusFilter;
    method: PaymentMethodFilter;
}

export const initialPaymentFilters: PaymentFilters = {
    query: "",
    status: "all",
    method: "all",
};

export function filterPayments(
    payments: Payment[],
    members: Member[],
    filters: PaymentFilters,
): Payment[] {
    const normalizedQuery = filters.query.trim().toLowerCase();

    return payments.filter((payment) => {
        const member = members.find((item) => item.id === payment.memberId);
        const memberName = member
            ? getMemberFullName(member).toLowerCase()
            : "";


        const matchesQuery =
            normalizedQuery.length === 0 ||
            memberName.includes(normalizedQuery) ||
            payment.memberCode.toLowerCase().includes(normalizedQuery) ||
            payment.receiptNumber.toLowerCase().includes(normalizedQuery) ||
            payment.referenceNumber?.toLowerCase().includes(normalizedQuery) === true ||
            payment.notes?.toLowerCase().includes(normalizedQuery) === true ||
            String(payment.amount).includes(normalizedQuery);

        const matchesStatus =
            filters.status === "all" || payment.status === filters.status;

        const matchesMethod =
            filters.method === "all" || payment.method === filters.method;

        return matchesQuery && matchesStatus && matchesMethod;


    });
}
