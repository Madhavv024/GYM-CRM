import { ArrowLeft, Printer, ReceiptText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useMembersStore } from "@/features/members/members.store";
import {
    formatCurrency,
    getMemberFullName,
} from "@/features/members/members.utils";
import { usePaymentsStore } from "@/features/payments/payments.store";
import {
    formatPaymentDate,
    getPaymentMethodLabel,
    getPaymentStatusLabel,
} from "@/features/payments/payments.utils";
import { usePlansStore } from "@/features/plans/plans.store";

const gymDetails = {
    name: "SK Fitness",
    address: "Sector A, Sheetal Nagar, Indore, Madhya Pradesh 452010",
    phone: "+91 93991 40148",
};

export function ReceiptPage() {
    const { paymentId } = useParams();
    const payments = usePaymentsStore((state) => state.payments);
    const members = useMembersStore((state) => state.members);
    const plans = usePlansStore((state) => state.plans);

    const payment = payments.find((item) => item.id === paymentId);

    if (!payment) {
        return (<div className="space-y-6"> <div className="print:hidden"> <Link
            to="/payments"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
        > <ArrowLeft className="size-4" />
            Back to payments </Link> </div>


            <EmptyState
                icon={<ReceiptText className="size-5" />}
                title="Receipt not found"
                description="This payment may have been deleted or the receipt link is invalid."
                action={
                    <Link
                        to="/payments"
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        View payments
                    </Link>

                }
            />
        </div>
        );


    }

    const member = members.find((item) => item.id === payment.memberId);
    const plan = member
        ? plans.find((item) => item.id === member.planId)
        : undefined;

    return (<div className="mx-auto max-w-4xl space-y-6"> <header className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between"> <Link
        to="/payments"
        className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
    > <ArrowLeft className="size-4" />
        Back to payments </Link>


        <Button onClick={() => window.print()}>
            <Printer className="size-4" />
            Print receipt
        </Button>
    </header>

        <main className="receipt-print-area overflow-hidden rounded-lg border border-border bg-card shadow-sm print:border-0 print:shadow-none">
            <div className="border-b-4 border-primary px-6 py-7 sm:px-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <img
                            src="/crm/sk-fitness-logo.png"
                            alt="SK Fitness"
                            className="size-14 object-contain"
                        />
                        <div>
                            <p className="text-2xl font-black tracking-tight text-foreground">
                                {gymDetails.name}
                            </p>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                {gymDetails.address}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {gymDetails.phone}
                            </p>
                        </div>
                    </div>

                    <div className="sm:text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                            Payment receipt
                        </p>
                        <p className="mt-2 text-xl font-black text-foreground">
                            {payment.receiptNumber}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Issued {formatPaymentDate(payment.paymentDate)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 px-6 py-7 sm:grid-cols-2 sm:px-10">
                <section>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        Received from
                    </p>
                    <p className="mt-3 text-lg font-bold text-foreground">
                        {member ? getMemberFullName(member) : "Deleted member"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Mobile: {member?.mobile ?? "Unavailable"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Member code: {payment.memberCode}
                    </p>
                </section>

                <section className="sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        Membership plan
                    </p>
                    <p className="mt-3 text-lg font-bold text-foreground">
                        {plan?.name ?? "Plan unavailable"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Payment date: {formatPaymentDate(payment.paymentDate)}
                    </p>
                </section>
            </div>

            <div className="mx-6 overflow-hidden rounded-md border border-border sm:mx-10">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border bg-muted/30 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground sm:px-5">
                    <p>Payment details</p>
                    <p>Amount</p>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-5 sm:px-5">
                    <div>
                        <p className="font-bold text-foreground">
                            {getPaymentMethodLabel(payment.method)} payment
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Status: {getPaymentStatusLabel(payment.status)}
                        </p>
                        {payment.referenceNumber ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                                Reference: {payment.referenceNumber}
                            </p>
                        ) : null}
                        {payment.notes ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                                Note: {payment.notes}
                            </p>
                        ) : null}
                    </div>

                    <p className="text-xl font-black text-foreground">
                        {formatCurrency(payment.amount)}
                    </p>
                </div>
            </div>

            <div className="px-6 py-7 sm:px-10">
                <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-4">
                    <p className="text-sm font-semibold text-foreground">
                        Amount received: {formatCurrency(payment.amount)}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        This receipt confirms the recorded payment only. It does not show
                        a balance due because the CRM does not yet maintain a dedicated
                        billing and dues ledger.
                    </p>
                </div>

                <p className="mt-8 text-center text-xs text-muted-foreground">
                    Thank you for choosing {gymDetails.name}.
                </p>
            </div>
        </main>
    </div>


    );
}
