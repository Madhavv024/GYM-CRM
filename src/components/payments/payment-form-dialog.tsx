import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMembersStore } from "@/features/members/members.store";
import {
  usePaymentsStore,
  type CreatePaymentInput,
} from "@/features/payments/payments.store";
import { getMemberFullName } from "@/features/members/members.utils";
import type { Payment } from "@/types";

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment;
}

interface PaymentFormValues {
  memberId: string;
  amount: string;
  paymentDate: string;
  method: Payment["method"];
  status: Payment["status"];
  referenceNumber: string;
  notes: string;
}

function getTodayDate() {
  return format(new Date(), "yyyy-MM-dd");
}

function getInitialValues(payment?: Payment): PaymentFormValues {
  if (payment) {
    return {
      memberId: payment.memberId,
      amount: String(payment.amount),
      paymentDate: payment.paymentDate,
      method: payment.method,
      status: payment.status,
      referenceNumber: payment.referenceNumber ?? "",
      notes: payment.notes ?? "",
    };
  }

  return {
    memberId: "",
    amount: "",
    paymentDate: getTodayDate(),
    method: "upi",
    status: "successful",
    referenceNumber: "",
    notes: "",
  };
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  payment,
}: PaymentFormDialogProps) {
  const members = useMembersStore((state) => state.members);
  const addPayment = usePaymentsStore((state) => state.addPayment);
  const updatePayment = usePaymentsStore((state) => state.updatePayment);

  const [values, setValues] = useState<PaymentFormValues>(() =>
    getInitialValues(payment),
  );
  const [error, setError] = useState<string | null>(null);

  const sortedMembers = useMemo(
    () =>
      [...members].sort((firstMember, secondMember) =>
        getMemberFullName(firstMember).localeCompare(
          getMemberFullName(secondMember),
        ),
      ),
    [members],
  );

  useEffect(() => {
    if (open) {
      setValues(getInitialValues(payment));
      setError(null);
    }
  }, [open, payment]);

  function updateValue<Key extends keyof PaymentFormValues>(
    key: Key,
    value: PaymentFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(values.amount);
    const selectedMember = members.find(
      (member) => member.id === values.memberId,
    );

    if (!payment && !selectedMember) {
      setError("Select the member making this payment.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (!values.paymentDate) {
      setError("Select the payment date.");
      return;
    }

    if (payment) {
      updatePayment(payment.id, {
        amount,
        paymentDate: values.paymentDate,
        method: values.method,
        status: values.status,
        referenceNumber: values.referenceNumber || undefined,
        notes: values.notes || undefined,
      });

      toast.success("Payment record updated.");
    } else if (selectedMember) {
      const input: CreatePaymentInput = {
        memberId: selectedMember.id,
        memberCode: selectedMember.memberCode,
        amount,
        paymentDate: values.paymentDate,
        method: values.method,
        status: values.status,
        referenceNumber: values.referenceNumber || undefined,
        notes: values.notes || undefined,
      };

      addPayment(input);
      toast.success("Payment recorded successfully.");
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payment ? "Edit payment" : "Record payment"}</DialogTitle>
          <DialogDescription>
            {payment
              ? "Update this collection record."
              : "Record a collection against an existing member."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Member" htmlFor="payment-member">
              <Select
                id="payment-member"
                value={values.memberId}
                disabled={Boolean(payment)}
                onChange={(event) => updateValue("memberId", event.target.value)}
              >
                <option value="">Select member</option>
                {sortedMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {getMemberFullName(member)} · {member.memberCode}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Amount" htmlFor="payment-amount">
              <Input
                id="payment-amount"
                type="number"
                min="1"
                step="1"
                inputMode="decimal"
                value={values.amount}
                onChange={(event) => updateValue("amount", event.target.value)}
                placeholder="0"
              />
            </Field>

            <Field label="Payment date" htmlFor="payment-date">
              <Input
                id="payment-date"
                type="date"
                value={values.paymentDate}
                onChange={(event) =>
                  updateValue("paymentDate", event.target.value)
                }
              />
            </Field>

            <Field label="Method" htmlFor="payment-method">
              <Select
                id="payment-method"
                value={values.method}
                onChange={(event) =>
                  updateValue(
                    "method",
                    event.target.value as Payment["method"],
                  )
                }
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank transfer</option>
              </Select>
            </Field>

            <Field label="Status" htmlFor="payment-status">
              <Select
                id="payment-status"
                value={values.status}
                onChange={(event) =>
                  updateValue(
                    "status",
                    event.target.value as Payment["status"],
                  )
                }
              >
                <option value="successful">Successful</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Select>
            </Field>

            <Field label="Reference number" htmlFor="payment-reference">
              <Input
                id="payment-reference"
                value={values.referenceNumber}
                onChange={(event) =>
                  updateValue("referenceNumber", event.target.value)
                }
                placeholder="UPI / bank reference"
              />
            </Field>
          </div>

          <Field label="Notes" htmlFor="payment-notes">
            <Textarea
              id="payment-notes"
              value={values.notes}
              onChange={(event) => updateValue("notes", event.target.value)}
              placeholder="Optional collection note"
            />
          </Field>

          {error ? (
            <p className="rounded-md border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {payment ? "Save changes" : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}