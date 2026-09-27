import FilterBar from "@/components/FilterBar";
import ExpenseTable from "@/components/ExpenseTable";
import { listAccounts } from "@/lib/accounts";
import { listExpenseFiltered } from "@/lib/queries";

export default async function ExpensePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const year = Number(sp.year) || new Date().getFullYear();

  const [rows, accounts] = await Promise.all([
    listExpenseFiltered({
    year,
    category: sp.category,
    from: sp.from,
    to: sp.to,
    paymentMode: sp.paymentMode,
    bankAccount: sp.bankAccount,
    transactionType: sp.transactionType,
    search: sp.search,
  }),
    listAccounts(),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-800">Expense — {year}</h1>
      <FilterBar basePath="/expense" year={year} showCategory values={sp} accounts={accounts} />
      <ExpenseTable rows={rows} year={year} accounts={accounts} />
    </div>
  );
}
