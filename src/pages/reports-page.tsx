import { useMemo, type ReactNode } from "react";
import {
  BarChart3,
  CircleDollarSign,
  ReceiptText,
  // RefreshCw,
  Target,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { MembershipStatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpensesStore } from "@/features/expenses/expenses.store";
import { useLeadsStore } from "@/features/leads/leads.store";
import { useMembersStore } from "@/features/members/members.store";
import {
  formatCurrency,
  formatMemberDate,
  getMemberFullName,
  getMembershipStatus,
} from "@/features/members/members.utils";
import { usePaymentsStore } from "@/features/payments/payments.store";
import { usePlansStore } from "@/features/plans/plans.store";
import {
  getCurrentMonthCollections,
  getCurrentMonthExpenses,
  getExpenseCategoryBreakdown,
  getLeadConversionSummary,
  getMembershipHealthSummary,
  getMonthlyFinancialTrend,
  getNetProfit,
  getRenewalsDueCount,
  getTotalPendingDues,
} from "@/features/reports/reports.utils";

export function ReportsPage() {
  const members = useMembersStore((state) => state.members);
  const payments = usePaymentsStore((state) => state.payments);
  const leads = useLeadsStore((state) => state.leads);
  const plans = usePlansStore((state) => state.plans);
  const expenses = useExpensesStore((state) => state.expenses);

  const report = useMemo(() => {
    const collections = getCurrentMonthCollections(payments);
    const monthlyExpenses = getCurrentMonthExpenses(expenses);


    const pendingDues = getTotalPendingDues(
      members,
      payments,
      (planId) => {
        const plan = plans.find((item) => item.id === planId);

        return plan ? plan.price + plan.joiningFee : undefined;
      },
    );

    const renewalQueue = members
      .filter((member) => {
        const status = getMembershipStatus(member);

        return status === "expiring_soon" || status === "expired";
      })
      .sort(
        (firstMember, secondMember) =>
          new Date(firstMember.membershipEndDate).getTime() -
          new Date(secondMember.membershipEndDate).getTime(),
      )
      .slice(0, 6);

    return {
      collections,
      monthlyExpenses,
      netProfit: getNetProfit(collections, monthlyExpenses),
      pendingDues,
      membershipHealth: getMembershipHealthSummary(members),
      renewalQueue,
      renewalCount: getRenewalsDueCount(members),
      leadConversion: getLeadConversionSummary(leads),
      expenseCategoryBreakdown: getExpenseCategoryBreakdown(expenses),
      monthlyFinancialTrend: getMonthlyFinancialTrend(payments, expenses),
    };


  }, [expenses, leads, members, payments, plans]);

  const maximumTrendValue = Math.max(
    ...report.monthlyFinancialTrend.flatMap((month) => [
      month.collections,
      month.expenses,
    ]),
    1,
  );

  return (<div className="space-y-6">
    <PageHeader
      title="Business Reports"
      description="Review collections, expenses, profitability, membership health, and lead conversion."
      actions={
        <Button variant="outline" onClick={() => window.print()}> <BarChart3 className="size-4" />
          Print report </Button>
      }
    />


    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ReportMetricCard
        label="Monthly collections"
        value={formatCurrency(report.collections)}
        description="Successful payments this month"
        icon={<CircleDollarSign className="size-5" />}
      />
      <ReportMetricCard
        label="Monthly expenses"
        value={formatCurrency(report.monthlyExpenses)}
        description="Recorded expenses this month"
        icon={<ReceiptText className="size-5" />}
      />
      <ReportMetricCard
        label="Net profit"
        value={formatCurrency(report.netProfit)}
        description="Successful collections minus expenses"
        icon={<TrendingUp className="size-5" />}
        valueClassName={
          report.netProfit < 0 ? "text-destructive" : undefined
        }
      />
      <ReportMetricCard
        label="Pending dues"
        value={formatCurrency(report.pendingDues)}
        description="Based on active member plan values"
        icon={<WalletCards className="size-5" />}
      />
    </section>

    <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <article className="glass-surface rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Collections versus expenses
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Six-month comparison of successful collections and recorded expenses.
            </p>
          </div>
          <BarChart3 className="size-5 text-primary" />
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            Collections
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-muted-foreground/60" />
            Expenses
          </div>
        </div>

        <div className="mt-6 flex h-64 items-end gap-3">
          {report.monthlyFinancialTrend.map((month) => {
            const collectionHeight = Math.max(
              (month.collections / maximumTrendValue) * 100,
              month.collections > 0 ? 8 : 2,
            );
            const expenseHeight = Math.max(
              (month.expenses / maximumTrendValue) * 100,
              month.expenses > 0 ? 8 : 2,
            );

            return (
              <div
                key={month.label}
                className="flex flex-1 flex-col justify-end gap-2"
              >
                <div className="flex h-48 items-end justify-center gap-1.5">
                  <div
                    className="w-1/2 rounded-t-sm bg-primary/75 transition-colors hover:bg-primary"
                    style={{ height: `${collectionHeight}%` }}
                    title={`${month.label} collections: ${formatCurrency(month.collections)}`}
                  />
                  <div
                    className="w-1/2 rounded-t-sm bg-muted-foreground/55 transition-colors hover:bg-muted-foreground/75"
                    style={{ height: `${expenseHeight}%` }}
                    title={`${month.label} expenses: ${formatCurrency(month.expenses)}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-muted-foreground">
                    {month.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatCurrency(month.netProfit)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Amount below each month represents net profit for that month.
        </p>
      </article>

      <article className="solid-surface rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Expense breakdown
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              All recorded expenses grouped by category.
            </p>
          </div>
          <ReceiptText className="size-5 text-primary" />
        </div>

        {report.expenseCategoryBreakdown.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No expenses have been recorded yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {report.expenseCategoryBreakdown.map((category) => (
              <ExpenseCategoryRow
                key={category.category}
                label={category.label}
                amount={category.amount}
                percentage={category.percentage}
              />
            ))}
          </div>
        )}
      </article>
    </section>

    <section className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
      <article className="solid-surface rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Membership health
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Current status distribution across all members.
            </p>
          </div>
          <Users className="size-5 text-primary" />
        </div>

        <div className="mt-6 space-y-4">
          <MembershipHealthRow
            label="Active"
            count={report.membershipHealth.active}
            total={members.length}
            variant="success"
          />
          <MembershipHealthRow
            label="Expiring soon"
            count={report.membershipHealth.expiringSoon}
            total={members.length}
            variant="warning"
          />
          <MembershipHealthRow
            label="Expired"
            count={report.membershipHealth.expired}
            total={members.length}
            variant="danger"
          />
          <MembershipHealthRow
            label="Paused"
            count={report.membershipHealth.paused}
            total={members.length}
            variant="info"
          />
        </div>
      </article>

      <article className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-bold text-foreground">
            Lead conversion
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lead-to-member conversion performance.
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-black tracking-tight text-foreground">
                {report.leadConversion.conversionRate}%
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Overall conversion rate
              </p>
            </div>
            <Target className="size-6 text-primary" />
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${report.leadConversion.conversionRate}%` }}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">
              {report.leadConversion.convertedLeads}
            </span>{" "}
            converted from{" "}
            <span className="font-bold text-foreground">
              {report.leadConversion.totalLeads}
            </span>{" "}
            total leads.
          </p>
        </div>
      </article>
    </section>

    <section className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
      <article className="rounded-lg border border-border bg-card">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Renewal attention queue
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Members with expired or near-expiry memberships.
            </p>
          </div>
          <Link
            to="/members"
            className="shrink-0 text-sm font-bold text-primary hover:opacity-80"
          >
            View members
          </Link>
        </div>

        {report.renewalQueue.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No members currently need renewal attention.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {report.renewalQueue.map((member) => (
              <Link
                key={member.id}
                to={`/members/${member.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="font-bold text-foreground">
                    {getMemberFullName(member)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {member.memberCode} · Ends{" "}
                    {formatMemberDate(member.membershipEndDate)}
                  </p>
                </div>
                <MembershipStatusBadge status={getMembershipStatus(member)} />
              </Link>
            ))}
          </div>
        )}
      </article>

      <article className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-bold text-foreground">
            Report scope
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Current data sources included in this report.
          </p>
        </div>

        <div className="space-y-3 p-5 text-sm">
          <ReportScopeItem label="Members and membership status" included />
          <ReportScopeItem label="Payment collections and pending dues" included />
          <ReportScopeItem label="Expense and net-profit reporting" included />
          <ReportScopeItem label="Lead conversion performance" included />
        </div>

        <div className="border-t border-border p-5">
          <p className="text-xs leading-5 text-muted-foreground">
            Net profit is calculated from successful payments minus recorded
            expenses. Pending dues remain an estimate until a dedicated billing
            and dues model is introduced.
          </p>
        </div>
      </article>
    </section>
  </div>


  );
}

function ReportMetricCard({
  label,
  value,
  description,
  icon,
  valueClassName,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  valueClassName?: string;
}) {
  return (<article className="glass-surface rounded-lg p-5"> <div className="flex items-center justify-between gap-3"> <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
    {label} </p> <span className="text-primary">{icon}</span> </div>
    <p
      className={`mt-3 text-2xl font-black tracking-tight text-foreground ${valueClassName ?? ""}`}
    >
      {value} </p> <p className="mt-2 text-sm text-muted-foreground">{description}</p> </article>
  );
}

function ExpenseCategoryRow({
  label,
  amount,
  percentage,
}: {
  label: string;
  amount: number;
  percentage: number;
}) {
  return (<div> <div className="flex items-center justify-between gap-3"> <p className="text-sm font-bold text-foreground">{label}</p> <p className="text-sm font-bold text-foreground">
    {formatCurrency(amount)} </p> </div> <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${percentage}%` }}
      /> </div> <p className="mt-1 text-xs text-muted-foreground">
      {percentage}% of recorded expenses </p> </div>
  );
}

function MembershipHealthRow({
  label,
  count,
  total,
  variant,
}: {
  label: string;
  count: number;
  total: number;
  variant: "success" | "warning" | "danger" | "info";
}) {
  const percentage = total === 0 ? 0 : Math.round((count / total) * 100);

  return (<div> <div className="flex items-center justify-between gap-3"> <Badge variant={variant}>{label}</Badge> <p className="text-sm font-bold text-foreground">
    {count} <span className="text-muted-foreground">({percentage}%)</span> </p> </div> <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${percentage}%` }}
      /> </div> </div>
  );
}

function ReportScopeItem({
  label,
  included,
}: {
  label: string;
  included: boolean;
}) {
  return (<div className="flex items-center justify-between gap-4"> <p className="text-muted-foreground">{label}</p>
    <Badge variant={included ? "success" : "muted"}>
      {included ? "Included" : "Pending"} </Badge> </div>
  );
}
