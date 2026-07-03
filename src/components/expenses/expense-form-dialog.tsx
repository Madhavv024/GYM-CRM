import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    expenseCategoryOptions,
    formatExpenseDate,
} from "@/features/expenses/expenses.utils";
import {
    type CreateExpenseInput,
    useExpensesStore,
} from "@/features/expenses/expenses.store";
import type { Expense, ExpenseCategory, PaymentMethod } from "@/types";

interface ExpenseFormValues {
    category: ExpenseCategory;
    amount: string;
    expenseDate: string;
    paymentMethod: PaymentMethod;
    notes: string;
}

interface ExpenseFormDialogProps {
    expense?: Expense;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const paymentMethodOptions: Array<{
    value: PaymentMethod;
    label: string;
}> = [
        { value: "cash", label: "Cash" },
        { value: "upi", label: "UPI" },
        { value: "card", label: "Card" },
        { value: "bank_transfer", label: "Bank Transfer" },
    ];

function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

function getFormValues(expense?: Expense): ExpenseFormValues {
    if (!expense) {
        return {
            category: "other",
            amount: "",
            expenseDate: getTodayDate(),
            paymentMethod: "cash",
            notes: "",
        };
    }

    return {
        category: expense.category,
        amount: String(expense.amount),
        expenseDate: expense.expenseDate,
        paymentMethod: expense.paymentMethod,
        notes: expense.notes ?? "",
    };
}

function parseExpenseInput(
    values: ExpenseFormValues,
): CreateExpenseInput | null {
    const amount = Number(values.amount);
    const expenseDate = values.expenseDate.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
        toast.error("Expense amount must be greater than zero.");
        return null;
    }

    if (!expenseDate) {
        toast.error("Expense date is required.");
        return null;
    }

    return {
        category: values.category,
        amount,
        expenseDate,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
    };
}

export function ExpenseFormDialog({
    expense,
    open,
    onOpenChange,
}: ExpenseFormDialogProps) {
    const addExpense = useExpensesStore((state) => state.addExpense);
    const updateExpense = useExpensesStore((state) => state.updateExpense);
    const [values, setValues] = useState<ExpenseFormValues>(() =>
        getFormValues(expense),
    );

    const isEditing = Boolean(expense);

    useEffect(() => {
        if (open) {
            setValues(getFormValues(expense));
        }
    }, [expense, open]);

    function updateValue<Key extends keyof ExpenseFormValues>(
        key: Key,
        value: ExpenseFormValues[Key],
    ) {
        setValues((currentValues) => ({
            ...currentValues,
            [key]: value,
        }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();


        const expenseInput = parseExpenseInput(values);

        if (!expenseInput) {
            return;
        }

        if (expense) {
            updateExpense(expense.id, expenseInput);
            toast.success("Expense updated.");
        } else {
            addExpense(expenseInput);
            toast.success("Expense recorded.");
        }

        onOpenChange(false);


    }

    return (<Dialog onOpenChange={onOpenChange} open={open}> <DialogContent className="border-border bg-card text-card-foreground sm:max-w-lg"> <DialogHeader> <DialogTitle>
        {isEditing ? "Edit Expense" : "Record Expense"} </DialogTitle> <DialogDescription>
            Track operating costs for SK Fitness.
            {expense ? ` Recorded on ${formatExpenseDate(expense.createdAt)}.` : ""} </DialogDescription> </DialogHeader>


        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="expense-category">Category</Label>
                    <Select
                        id="expense-category"
                        onChange={(event) =>
                            updateValue(
                                "category",
                                event.target.value as ExpenseCategory,
                            )
                        }
                        value={values.category}
                    >
                        {expenseCategoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="expense-amount">Amount (₹)</Label>
                    <Input
                        id="expense-amount"
                        min="0"
                        onChange={(event) => updateValue("amount", event.target.value)}
                        placeholder="0"
                        step="0.01"
                        type="number"
                        value={values.amount}
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="expense-date">Expense date</Label>
                    <Input
                        id="expense-date"
                        onChange={(event) =>
                            updateValue("expenseDate", event.target.value)
                        }
                        type="date"
                        value={values.expenseDate}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="expense-payment-method">Payment method</Label>
                    <Select
                        id="expense-payment-method"
                        onChange={(event) =>
                            updateValue(
                                "paymentMethod",
                                event.target.value as PaymentMethod,
                            )
                        }
                        value={values.paymentMethod}
                    >
                        {paymentMethodOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="expense-notes">Notes</Label>
                <Textarea
                    id="expense-notes"
                    onChange={(event) => updateValue("notes", event.target.value)}
                    placeholder="Example: Monthly electricity bill for June."
                    rows={4}
                    value={values.notes}
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button onClick={() => onOpenChange(false)} type="button" variant="secondary">
                    Cancel
                </Button>
                <Button type="submit">
                    {isEditing ? "Save Changes" : "Record Expense"}
                </Button>
            </div>
        </form>
    </DialogContent>
    </Dialog>


    );
}
