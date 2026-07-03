import { useMemo, useState } from "react";
import {
    Edit3,
    Plus,
    ReceiptIndianRupee,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog";
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
import { EmptyState } from "@/components/shared/empty-state";
import { useExpensesStore } from "@/features/expenses/expenses.store";
import {
    expenseCategoryOptions,
    filterExpenses,
    formatExpenseCurrency,
    formatExpenseDate,
    getCurrentMonthExpenseRange,
    getExpenseCategoryLabel,
    getExpenseCategoryTotals,
    getExpenseTotal,
} from "@/features/expenses/expenses.utils";
import type { Expense, ExpenseCategory } from "@/types";

type ExpenseDateFilter = "current_month" | "all_time";

interface ExpenseFilters {
    category: ExpenseCategory | "all";
    dateRange: ExpenseDateFilter;
    query: string;
}

const initialExpenseFilters: ExpenseFilters = {
    category: "all",
    dateRange: "current_month",
    query: "",
};

function getExpenseFilterDateRange(dateRange: ExpenseDateFilter) {
    if (dateRange === "current_month") {
        return getCurrentMonthExpenseRange();
    }

    return {
        startDate: new Date(2000, 0, 1),
        endDate: new Date(2100, 11, 31, 23, 59, 59, 999),
    };
}

export function ExpensesPage() {
    const expenses = useExpensesStore((state) => state.expenses);
    const deleteExpense = useExpensesStore((state) => state.deleteExpense);

    const [filters, setFilters] = useState<ExpenseFilters>(initialExpenseFilters);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | undefined>();

    const { startDate, endDate } = useMemo(
        () => getExpenseFilterDateRange(filters.dateRange),
        [filters.dateRange],
    );

    const filteredExpenses = useMemo(
        () =>
            filterExpenses({
                expenses,
                category: filters.category,
                searchQuery: filters.query,
                startDate,
                endDate,
            }),
        [endDate, expenses, filters.category, filters.query, startDate],
    );

    const currentMonthExpenses = useMemo(() => {
        const currentMonthRange = getCurrentMonthExpenseRange();


        return getExpenseTotal(
            filterExpenses({
                expenses,
                category: "all",
                searchQuery: "",
                startDate: currentMonthRange.startDate,
                endDate: currentMonthRange.endDate,
            }),
        );


    }, [expenses]);

    const selectedRangeTotal = useMemo(
        () => getExpenseTotal(filteredExpenses),
        [filteredExpenses],
    );

    const categoryTotals = useMemo(
        () => getExpenseCategoryTotals(filteredExpenses).filter((item) => item.amount > 0),
        [filteredExpenses],
    );

    const activeFilterCount = [
        filters.category !== "all",
        filters.dateRange !== "current_month",
        filters.query.trim().length > 0,
    ].filter(Boolean).length;

    function updateFilters(updates: Partial<ExpenseFilters>) {
        setFilters((currentFilters) => ({
            ...currentFilters,
            ...updates,
        }));
    }

    function handleCreateExpense() {
        setExpenseToEdit(undefined);
        setIsFormOpen(true);
    }

    function handleEditExpense(expense: Expense) {
        setExpenseToEdit(expense);
        setIsFormOpen(true);
    }

    function handleFormOpenChange(open: boolean) {
        setIsFormOpen(open);


        if (!open) {
            setExpenseToEdit(undefined);
        }


    }

    function handleDeleteExpense() {
        if (!expenseToDelete) {
            return;
        }


        deleteExpense(expenseToDelete.id);
        toast.success("Expense record deleted.");
        setExpenseToDelete(undefined);


    }

    function clearFilters() {
        setFilters(initialExpenseFilters);
    }

    return (<div className="space-y-6"> <section className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between"> <div> <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
        Operating costs </p> <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
            Expenses </h1> <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Record operating expenses and monitor monthly outflow for SK Fitness. </p> </div>


        <Button onClick={handleCreateExpense}>
            <Plus className="size-4" />
            Add expense
        </Button>
    </section>

        <section className="grid gap-4 md:grid-cols-3">
            <SummaryCard
                label="Current month expenses"
                value={formatExpenseCurrency(currentMonthExpenses)}
                description="All recorded expenses this month"
            />
            <SummaryCard
                label="Selected range total"
                value={formatExpenseCurrency(selectedRangeTotal)}
                description={`${filteredExpenses.length} expense records shown`}
            />
            <SummaryCard
                label="Expense categories"
                value={String(categoryTotals.length)}
                description="Categories with recorded expenses"
            />
        </section>

        <section className="rounded-lg border border-border bg-card">
            <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-base font-bold text-foreground">
                        Expense ledger
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {filteredExpenses.length} of {expenses.length} expenses shown
                    </p>
                </div>

                {activeFilterCount > 0 ? (
                    <Button onClick={clearFilters} size="sm" variant="ghost">
                        <X className="size-3.5" />
                        Clear filters ({activeFilterCount})
                    </Button>
                ) : null}
            </div>

            <div className="grid gap-3 border-b border-border bg-muted/20 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px]">
                <div className="relative">
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        aria-label="Search expenses"
                        className="pl-9"
                        onChange={(event) => updateFilters({ query: event.target.value })}
                        placeholder="Search notes or category"
                        value={filters.query}
                    />
                </div>

                <Select
                    aria-label="Filter expenses by category"
                    onChange={(event) =>
                        updateFilters({
                            category: event.target.value as ExpenseFilters["category"],
                        })
                    }
                    value={filters.category}
                >
                    <option value="all">All categories</option>
                    {expenseCategoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Select>

                <Select
                    aria-label="Filter expenses by date range"
                    onChange={(event) =>
                        updateFilters({
                            dateRange: event.target.value as ExpenseDateFilter,
                        })
                    }
                    value={filters.dateRange}
                >
                    <option value="current_month">Current month</option>
                    <option value="all_time">All time</option>
                </Select>
            </div>

            {filteredExpenses.length === 0 ? (
                <EmptyState
                    action={
                        expenses.length === 0 ? (
                            <Button onClick={handleCreateExpense}>
                                <Plus className="size-4" />
                                Add expense
                            </Button>
                        ) : (
                            <Button onClick={clearFilters} variant="outline">
                                Clear filters
                            </Button>
                        )
                    }
                    className="m-4"
                    description={
                        expenses.length === 0
                            ? "Record the first operating expense to begin tracking gym outflow."
                            : "Try changing the search term or clearing the active filters."
                    }
                    icon={<ReceiptIndianRupee className="size-5" />}
                    title={
                        expenses.length === 0 ? "No expenses recorded" : "No expenses found"
                    }
                />
            ) : (
                <>
                    <div className="hidden overflow-x-auto lg:block">
                        <table className="w-full min-w-[920px] text-left">
                            <thead className="bg-muted/30 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-3">Category</th>
                                    <th className="px-5 py-3">Notes</th>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Method</th>
                                    <th className="px-5 py-3">Amount</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredExpenses.map((expense) => (
                                    <ExpenseTableRow
                                        expense={expense}
                                        key={expense.id}
                                        onDelete={setExpenseToDelete}
                                        onEdit={handleEditExpense}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid gap-3 p-4 lg:hidden">
                        {filteredExpenses.map((expense) => (
                            <ExpenseMobileCard
                                expense={expense}
                                key={expense.id}
                                onDelete={setExpenseToDelete}
                                onEdit={handleEditExpense}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>

        {categoryTotals.length > 0 ? (
            <section className="rounded-lg border border-border bg-card p-5">
                <div>
                    <h2 className="text-base font-bold text-foreground">
                        Category totals
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Expense distribution for the selected range.
                    </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {categoryTotals.map((item) => (
                        <div
                            className="rounded-lg border border-border bg-muted/20 p-4"
                            key={item.category}
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                {item.label}
                            </p>
                            <p className="mt-2 text-lg font-black text-foreground">
                                {formatExpenseCurrency(item.amount)}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        ) : null}

        <ExpenseFormDialog
            expense={expenseToEdit}
            onOpenChange={handleFormOpenChange}
            open={isFormOpen}
        />

        <DeleteExpenseDialog
            expense={expenseToDelete}
            onConfirm={handleDeleteExpense}
            onOpenChange={(open) => {
                if (!open) {
                    setExpenseToDelete(undefined);
                }
            }}
        />
    </div>


    );
}

function ExpenseTableRow({
    expense,
    onEdit,
    onDelete,
}: {
    expense: Expense;
    onEdit: (expense: Expense) => void;
    onDelete: (expense: Expense) => void;
}) {
    return (<tr className="transition-colors hover:bg-muted/20"> <td className="px-5 py-4"> <Badge variant="muted">
        {getExpenseCategoryLabel(expense.category)} </Badge> </td> <td className="max-w-xs px-5 py-4 text-sm text-muted-foreground">
            {expense.notes || "No notes"} </td> <td className="px-5 py-4 text-sm text-muted-foreground">
            {formatExpenseDate(expense.expenseDate)} </td> <td className="px-5 py-4 text-sm font-medium text-foreground">
            {getPaymentMethodLabel(expense.paymentMethod)} </td> <td className="px-5 py-4 font-bold text-foreground">
            {formatExpenseCurrency(expense.amount)} </td> <td className="px-5 py-4"> <ExpenseActions expense={expense} onDelete={onDelete} onEdit={onEdit} /> </td> </tr>
    );
}

function ExpenseMobileCard({
    expense,
    onEdit,
    onDelete,
}: {
    expense: Expense;
    onEdit: (expense: Expense) => void;
    onDelete: (expense: Expense) => void;
}) {
    return (<article className="rounded-lg border border-border bg-card p-4"> <div className="flex items-start justify-between gap-3"> <div> <Badge variant="muted">
        {getExpenseCategoryLabel(expense.category)} </Badge> <p className="mt-2 text-sm text-muted-foreground">
            {expense.notes || "No notes"} </p> </div> <p className="font-black text-foreground">
            {formatExpenseCurrency(expense.amount)} </p> </div>


        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
            <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Date
                </dt>
                <dd className="mt-1 font-medium text-foreground">
                    {formatExpenseDate(expense.expenseDate)}
                </dd>
            </div>
            <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Method
                </dt>
                <dd className="mt-1 font-medium text-foreground">
                    {getPaymentMethodLabel(expense.paymentMethod)}
                </dd>
            </div>
        </dl>

        <div className="mt-4 border-t border-border pt-3">
            <ExpenseActions expense={expense} onDelete={onDelete} onEdit={onEdit} />
        </div>
    </article>


    );
}

function ExpenseActions({
    expense,
    onEdit,
    onDelete,
}: {
    expense: Expense;
    onEdit: (expense: Expense) => void;
    onDelete: (expense: Expense) => void;
}) {
    return (<div className="flex items-center justify-end gap-1">
        <Button
            aria-label={`Edit ${getExpenseCategoryLabel(expense.category)} expense`}
            onClick={() => onEdit(expense)}
            size="icon"
            title="Edit expense"
            variant="ghost"
        > <Edit3 className="size-4" /> </Button>
        <Button
            aria-label={`Delete ${getExpenseCategoryLabel(expense.category)} expense`}
            className="text-danger hover:bg-danger/10 hover:text-danger"
            onClick={() => onDelete(expense)}
            size="icon"
            title="Delete expense"
            variant="ghost"
        > <Trash2 className="size-4" /> </Button> </div>
    );
}

function DeleteExpenseDialog({
    expense,
    onConfirm,
    onOpenChange,
}: {
    expense: Expense | undefined;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
}) {
    return (<AlertDialog onOpenChange={onOpenChange} open={Boolean(expense)}> <AlertDialogContent className="border-border bg-card text-card-foreground"> <AlertDialogHeader> <AlertDialogTitle>Delete expense record?</AlertDialogTitle> <AlertDialogDescription>
        {expense
            ? `This will permanently remove the ${getExpenseCategoryLabel(expense.category).toLowerCase()} expense recorded on ${formatExpenseDate(expense.expenseDate)}. This action cannot be undone.`
            : "This action cannot be undone."} </AlertDialogDescription> </AlertDialogHeader>

        <AlertDialogFooter>
            <AlertDialogCancel className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-transparent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                Cancel
            </AlertDialogCancel>

            <AlertDialogAction
                className="inline-flex h-10 items-center justify-center rounded-md bg-danger px-4 text-sm font-semibold text-white transition-colors hover:bg-danger/90"
                onClick={onConfirm}
            >
                Delete expense
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>


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
    return (<div className="glass-surface rounded-lg border border-border p-5"> <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label} </p> <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
            {value} </p> <p className="mt-2 text-sm text-muted-foreground">{description}</p> </div>
    );
}

function getPaymentMethodLabel(method: Expense["paymentMethod"]) {
    const labels: Record<Expense["paymentMethod"], string> = {
        cash: "Cash",
        upi: "UPI",
        card: "Card",
        bank_transfer: "Bank transfer",
    };

    return labels[method];
}
