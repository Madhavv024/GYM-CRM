import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedPayments } from "@/data/seed";
import { createId, localStorageAdapter } from "@/lib/storage";
import type { Payment } from "@/types";

export interface CreatePaymentInput {
  memberId: string;
  memberCode: string;
  amount: number;
  paymentDate: string;
  method: Payment["method"];
  status: Payment["status"];
  referenceNumber?: string;
  notes?: string;
}

export type UpdatePaymentInput = Partial<Omit<CreatePaymentInput, "memberId" | "memberCode">>

interface PaymentsState {
  payments: Payment[];
  addPayment: (input: CreatePaymentInput) => Payment;
  updatePayment: (id: string, updates: UpdatePaymentInput) => void;
  deletePayment: (id: string) => void;
  resetPayments: () => void;
}

function getNextReceiptNumber(payments: Payment[]) {
  const receiptNumbers = payments
    .map((payment) => Number(payment.receiptNumber.replace("RCPT-", "")))
    .filter((receiptNumber) => Number.isFinite(receiptNumber));

  const highestReceiptNumber =
    receiptNumbers.length > 0 ? Math.max(...receiptNumbers) : 0;

  return `RCPT-${String(highestReceiptNumber + 1).padStart(4, "0")}`;
}

export const usePaymentsStore = create<PaymentsState>()(
  persist(
    (set, get) => ({
      payments: seedPayments,

      addPayment: (input) => {
        const now = new Date().toISOString();

        const payment: Payment = {
          id: createId("payment"),
          memberId: input.memberId,
          memberCode: input.memberCode,
          amount: input.amount,
          paymentDate: input.paymentDate,
          method: input.method,
          status: input.status,
          receiptNumber: getNextReceiptNumber(get().payments),
          referenceNumber: input.referenceNumber?.trim() || undefined,
          notes: input.notes?.trim() || undefined,
          createdAt: now,
        };

        set((state) => ({
          payments: [payment, ...state.payments],
        }));

        return payment;
      },

      updatePayment: (id, updates) => {
        set((state) => ({
          payments: state.payments.map((payment) =>
            payment.id === id
              ? {
                  ...payment,
                  ...updates,
                  referenceNumber: updates.referenceNumber?.trim() || undefined,
                  notes: updates.notes?.trim() || undefined,
                }
              : payment,
          ),
        }));
      },

      deletePayment: (id) => {
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id),
        }));
      },

      resetPayments: () => {
        set({ payments: seedPayments });
      },
    }),
    {
      name: "payments",
      storage: createJSONStorage(() => localStorageAdapter),
      version: 1,
    },
  ),
);