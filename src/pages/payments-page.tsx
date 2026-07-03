import { useMemo, useState } from "react";
import {
  Edit3,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PaymentFormDialog } from "@/components/payments/payment-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  filterPayments,
  initialPaymentFilters,
  type PaymentFilters,
} from "@/features/payments/payments.filters";
import { usePaymentsStore } from "@/features/payments/payments.store";
import {
  formatPaymentDate,
  getPartialPaymentTotal,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getSuccessfulPaymentTotal,
} from "@/features/payments/payments.utils";
import { formatCurrency, getMemberFullName } from "@/features/members/members.utils";
import { useMembersStore } from "@/features/members/members.store";
import type { Payment } from "@/types";

export function PaymentsPage() {
  const payments = usePaymentsStore((state) => state.payments);
  const deletePayment = usePaymentsStore((state) => state.deletePayment);
  const members = useMembersStore((state) => state.members);

  const [filters, setFilters] = useState<PaymentFilters>(initialPaymentFilters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | undefined>();
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | undefined>();

  const filteredPayments = useMemo(
    () => filterPayments(payments, members, filters),
    [filters, members, payments],
  );

  const totalCollected = useMemo(
    () => getSuccessfulPaymentTotal(payments),
    [payments],
  );

  const partialCollections = useMemo(
    () => getPartialPaymentTotal(payments),
    [payments],
  );

  const activeFilterCount = [
    filters.query.trim().length > 0,
    filters.status !== "all",
    filters.method !== "all",
  ].filter(Boolean).length;

  function updateFilters(updates: Partial<PaymentFilters>) {
    setFilters((current) => ({ ...current, ...updates }));
  }

  function handleCreatePayment() {
    setPaymentToEdit(undefined);
    setIsFormOpen(true);
  }

  function handleEditPayment(payment: Payment) {
    setPaymentToEdit(payment);
    setIsFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setIsFormOpen(open);

    if (!open) {
      setPaymentToEdit(undefined);
    }
  }

  function handleDeletePayment() {
    if (!paymentToDelete) {
      return;
    }

    const receiptNumber = paymentToDelete.receiptNumber;

    deletePayment(paymentToDelete.id);
    toast.success(`Payment ${receiptNumber} was deleted.`);
    setPaymentToDelete(undefined);
  }

  function clearFilters() {
    setFilters(initialPaymentFilters);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Collections
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
            Payments
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Track collections, pending dues, receipts, and payment history.
          </p>
        </div>

        <Button onClick={handleCreatePayment}>
          <Plus className="size-4" />
          Record payment
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Successful collections"
          value={formatCurrency(totalCollected)}
          description={`${payments.filter((payment) => payment.status === "successful").length} successful payments`}
        />
        <SummaryCard
          label="Partial collections"
          value={formatCurrency(partialCollections)}
          description={`${payments.filter((payment) => payment.status === "partial").length} partial payments`}
        />
        <SummaryCard
          label="Collection records"
          value={String(payments.length)}
          description="All local payment records"
        />
      </section>

      <section className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Payment ledger
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredPayments.length} of {payments.length} payments shown
            </p>
          </div>

          {activeFilterCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-3.5" />
              Clear filters ({activeFilterCount})
            </Button>
          ) : null}
        </div>

        <div className="grid gap-3 border-b border-border bg-muted/20 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_200px]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={filters.query}
              onChange={(event) => updateFilters({ query: event.target.value })}
              className="pl-9"
              placeholder="Search receipt, member code, reference"
              aria-label="Search payments"
            />
          </div>

          <Select
            value={filters.status}
            onChange={(event) =>
              updateFilters({
                status: event.target.value as PaymentFilters["status"],
              })
            }
            aria-label="Filter by payment status"
          >
            <option value="all">All statuses</option>
            <option value="successful">Successful</option>
            <option value="partial">Partial</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </Select>

          <Select
            value={filters.method}
            onChange={(event) =>
              updateFilters({
                method: event.target.value as PaymentFilters["method"],
              })
            }
            aria-label="Filter by payment method"
          >
            <option value="all">All methods</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank transfer</option>
          </Select>
        </div>

        {filteredPayments.length === 0 ? (
          <EmptyState
            className="m-4"
            icon={<ReceiptText className="size-5" />}
            title={payments.length === 0 ? "No payments recorded" : "No payments found"}
            description={
              payments.length === 0
                ? "Record the first member payment to begin your collection ledger."
                : "Try changing the search term or clearing the active filters."
            }
            action={
              payments.length === 0 ? (
                <Button onClick={handleCreatePayment}>
                  <Plus className="size-4" />
                  Record payment
                </Button>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-muted/30 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Receipt</th>
                    <th className="px-5 py-3">Member</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPayments.map((payment) => (
                    <PaymentTableRow
                      key={payment.id}
                      payment={payment}
                      memberName={getPaymentMemberName(payment, members)}
                      onEdit={handleEditPayment}
                      onDelete={setPaymentToDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filteredPayments.map((payment) => (
                <PaymentMobileCard
                  key={payment.id}
                  payment={payment}
                  memberName={getPaymentMemberName(payment, members)}
                  onEdit={handleEditPayment}
                  onDelete={setPaymentToDelete}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <PaymentFormDialog
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        payment={paymentToEdit}
      />

      <DeletePaymentDialog
        payment={paymentToDelete}
        onConfirm={handleDeletePayment}
        onOpenChange={(open) => {
          if (!open) {
            setPaymentToDelete(undefined);
          }
        }}
      />
    </div>
  );
}

function PaymentTableRow({
  payment,
  memberName,
  onEdit,
  onDelete,
}: {
  payment: Payment;
  memberName: string;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}) {
  return (
    <tr className="transition-colors hover:bg-white/[0.025]">
      <td className="px-5 py-4">
        <p className="font-bold text-foreground">{payment.receiptNumber}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {payment.referenceNumber ?? "No reference"}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="font-semibold text-foreground">{memberName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {payment.memberCode}
        </p>
      </td>
      <td className="px-5 py-4 text-sm text-muted-foreground">
        {formatPaymentDate(payment.paymentDate)}
      </td>
      <td className="px-5 py-4">
        <Badge variant="muted">{getPaymentMethodLabel(payment.method)}</Badge>
      </td>
      <td className="px-5 py-4 font-bold text-foreground">
        {formatCurrency(payment.amount)}
      </td>
      <td className="px-5 py-4">
        <PaymentStatusBadge status={payment.status} />
      </td>
      <td className="px-5 py-4">
        <PaymentActions payment={payment} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
}

function PaymentMobileCard({
  payment,
  memberName,
  onEdit,
  onDelete,
}: {
  payment: Payment;
  memberName: string;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-foreground">{payment.receiptNumber}</p>
          <p className="mt-1 text-sm text-muted-foreground">{memberName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {payment.memberCode}
          </p>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Amount
          </dt>
          <dd className="mt-1 font-bold text-foreground">
            {formatCurrency(payment.amount)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Method
          </dt>
          <dd className="mt-1">
            <Badge variant="muted">{getPaymentMethodLabel(payment.method)}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Date
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {formatPaymentDate(payment.paymentDate)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-border pt-3">
        <PaymentActions payment={payment} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </article>
  );
}

function PaymentActions({
  payment,
  onEdit,
  onDelete,
}: {
  payment: Payment;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}) {
  return (<div className="flex items-center justify-end gap-1"> <Link
    to={`/payments/${payment.id}/receipt`}
    className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    aria-label={`View receipt ${payment.receiptNumber}`}
    title="View receipt"
  >
    <ReceiptText className="size-4" />
  </Link>



    <Button
      variant="ghost"
      size="icon"
      onClick={() => onEdit(payment)}
      aria-label={`Edit ${payment.receiptNumber}`}
      title="Edit payment"
    >
      <Edit3 className="size-4" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      className="text-danger hover:bg-danger/10 hover:text-danger"
      onClick={() => onDelete(payment)}
      aria-label={`Delete ${payment.receiptNumber}`}
      title="Delete payment"
    >
      <Trash2 className="size-4" />
    </Button>
  </div>


  );
}


function PaymentStatusBadge({ status }: { status: Payment["status"] }) {
  const variantByStatus: Record<
    Payment["status"],
    "success" | "warning" | "danger" | "info"
  > = {
    successful: "success",
    partial: "warning",
    failed: "danger",
    refunded: "info",
  };

  return (
    <Badge variant={variantByStatus[status]}>
      {getPaymentStatusLabel(status)}
    </Badge>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="glass-surface rounded-lg border border-border p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function DeletePaymentDialog({
  payment,
  onConfirm,
  onOpenChange,
}: {
  payment: Payment | undefined;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={Boolean(payment)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete payment record?</AlertDialogTitle>
          <AlertDialogDescription>
            {payment
              ? `This will permanently remove receipt ${payment.receiptNumber}. This action cannot be undone.`
              : "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              className="bg-danger text-white hover:bg-danger/90"
              onClick={onConfirm}
            >
              Delete payment
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getPaymentMemberName(
  payment: Payment,
  members: ReturnType<typeof useMembersStore.getState>["members"],
) {
  const member = members.find((item) => item.id === payment.memberId);

  return member ? getMemberFullName(member) : "Deleted member";
}