import {
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { expenseCategoryOptions } from "@/features/expenses/expenses.utils";
import {
  getMembershipStatus,
  getPendingDues,
} from "@/features/members/members.utils";
import type {
  Expense,
  ExpenseCategory,
  Lead,
  Member,
  Payment,
} from "@/types";

export interface MonthlyCollectionPoint {
  label: string;
  total: number;
}

export interface MonthlyFinancialTrendPoint {
  label: string;
  collections: number;
  expenses: number;
  netProfit: number;
}

export interface ExpenseCategorySummary {
  category: ExpenseCategory;
  label: string;
  amount: number;
  percentage: number;
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

export function getCurrentMonthExpenses(expenses: Expense[]) {
  const currentMonth = new Date();

  return expenses
    .filter((expense) => isSameMonth(parseISO(expense.expenseDate), currentMonth))
    .reduce((total, expense) => total + expense.amount, 0);
}

export function getNetProfit(collections: number, expenses: number) {
  return collections - expenses;
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

export function getMonthlyFinancialTrend(
  payments: Payment[],
  expenses: Expense[],
  monthCount = 6,
): MonthlyFinancialTrendPoint[] {
  return Array.from({ length: monthCount }, (_, index) => {
    const monthDate = startOfMonth(subMonths(new Date(), monthCount - 1 - index));


    const collections = getSuccessfulPayments(payments)
      .filter((payment) => isSameMonth(parseISO(payment.paymentDate), monthDate))
      .reduce((total, payment) => total + payment.amount, 0);

    const monthlyExpenses = expenses
      .filter((expense) => isSameMonth(parseISO(expense.expenseDate), monthDate))
      .reduce((total, expense) => total + expense.amount, 0);

    return {
      label: format(monthDate, "MMM"),
      collections,
      expenses: monthlyExpenses,
      netProfit: getNetProfit(collections, monthlyExpenses),
    };


  });
}

export function getExpenseCategoryBreakdown(
  expenses: Expense[],
): ExpenseCategorySummary[] {
  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  return expenseCategoryOptions
    .map(({ value, label }) => {
      const amount = expenses
        .filter((expense) => expense.category === value)
        .reduce((total, expense) => total + expense.amount, 0);


      return {
        category: value,
        label,
        amount,
        percentage:
          totalExpenses === 0 ? 0 : Math.round((amount / totalExpenses) * 100),
      };
    })
    .filter((summary) => summary.amount > 0)
    .sort((firstSummary, secondSummary) => secondSummary.amount - firstSummary.amount);


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
