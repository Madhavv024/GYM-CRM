import {
    endOfMonth,
    format,
    isWithinInterval,
    parseISO,
    startOfMonth,
} from "date-fns";
import type { Expense, ExpenseCategory } from "@/types";

export const expenseCategoryOptions: Array<{
    value: ExpenseCategory;
    label: string;
}> = [
        { value: "rent", label: "Rent" },
        { value: "electricity", label: "Electricity" },
        { value: "salary", label: "Salary" },
        { value: "equipment", label: "Equipment" },
        { value: "maintenance", label: "Maintenance" },
        { value: "marketing", label: "Marketing" },
        { value: "supplies", label: "Supplies" },
        { value: "other", label: "Other" },
    ];

export function getExpenseCategoryLabel(category: ExpenseCategory) {
    return (
        expenseCategoryOptions.find((option) => option.value === category)?.label ??
        category
    );
}

export function formatExpenseCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatExpenseDate(date: string) {
    return format(parseISO(date), "dd MMM yyyy");
}

export function getCurrentMonthExpenseRange(referenceDate = new Date()) {
    return {
        startDate: startOfMonth(referenceDate),
        endDate: endOfMonth(referenceDate),
    };
}

export function getTodayExpenseRange(referenceDate = new Date()) {
    return {
        startDate: new Date(
            referenceDate.getFullYear(),
            referenceDate.getMonth(),
            referenceDate.getDate(),
        ),
        endDate: new Date(
            referenceDate.getFullYear(),
            referenceDate.getMonth(),
            referenceDate.getDate(),
            23,
            59,
            59,
            999,
        ),
    };
}


export function isExpenseWithinDateRange(
    expense: Expense,
    startDate: Date,
    endDate: Date,
) {
    return isWithinInterval(parseISO(expense.expenseDate), {
        start: startDate,
        end: endDate,
    });
}

export function filterExpenses({
    expenses,
    category,
    searchQuery,
    startDate,
    endDate,
}: {
    expenses: Expense[];
    category: ExpenseCategory | "all";
    searchQuery: string;
    startDate: Date;
    endDate: Date;
}) {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return expenses.filter((expense) => {
        const matchesCategory =
            category === "all" || expense.category === category;

        const matchesSearch =
            normalizedQuery.length === 0 ||
            expense.notes?.toLowerCase().includes(normalizedQuery) === true ||
            getExpenseCategoryLabel(expense.category)
                .toLowerCase()
                .includes(normalizedQuery);

        return (
            matchesCategory &&
            matchesSearch &&
            isExpenseWithinDateRange(expense, startDate, endDate)
        );


    });
}

export function getExpenseTotal(expenses: Expense[]) {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
}

export function getExpenseCategoryTotals(expenses: Expense[]) {
    return expenseCategoryOptions.map(({ value, label }) => ({
        category: value,
        label,
        amount: expenses
            .filter((expense) => expense.category === value)
            .reduce((total, expense) => total + expense.amount, 0),
    }));
}
