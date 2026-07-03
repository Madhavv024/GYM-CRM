import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedExpenses } from "@/data/seed";
import { createId, localStorageAdapter } from "@/lib/storage";
import type { Expense, ExpenseCategory, PaymentMethod } from "@/types";

export interface CreateExpenseInput {
    category: ExpenseCategory;
    amount: number;
    expenseDate: string;
    paymentMethod: PaymentMethod;
    notes?: string;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

interface ExpensesState {
    expenses: Expense[];
    addExpense: (input: CreateExpenseInput) => Expense;
    updateExpense: (id: string, updates: UpdateExpenseInput) => void;
    deleteExpense: (id: string) => void;
    resetExpenses: () => void;
}

function normalizeOptionalText(value: string | undefined) {
    return value?.trim() || undefined;
}

export const useExpensesStore = create<ExpensesState>()(
    persist(
        (set) => ({
            expenses: seedExpenses,


            addExpense: (input) => {
                const expense: Expense = {
                    id: createId("expense"),
                    title: `${input.category} Expense`,
                    category: input.category,
                    amount: input.amount,
                    expenseDate: input.expenseDate,
                    paymentMethod: input.paymentMethod,
                    notes: normalizeOptionalText(input.notes),
                    createdAt: new Date().toISOString(),
                };

                set((state) => ({
                    expenses: [expense, ...state.expenses],
                }));

                return expense;
            },

            updateExpense: (id, updates) => {
                set((state) => ({
                    expenses: state.expenses.map((expense) =>
                        expense.id === id
                            ? {
                                ...expense,
                                ...updates,
                                notes:
                                    updates.notes === undefined
                                        ? expense.notes
                                        : normalizeOptionalText(updates.notes),
                            }
                            : expense,
                    ),
                }));
            },

            deleteExpense: (id) => {
                set((state) => ({
                    expenses: state.expenses.filter((expense) => expense.id !== id),
                }));
            },

            resetExpenses: () => {
                set({ expenses: seedExpenses });
            },
        }),
        {
            name: "expenses",
            storage: createJSONStorage(() => localStorageAdapter),
            version: 1,
        },


    ),
);
