import FilterBar from "@/components/FilterBar";
import IncomeTable from "@/components/IncomeTable";
import { listAccounts } from "@/lib/accounts";
import { listIncomeFiltered } from "@/lib/queries";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const year = Number(sp.year) || new Date().getFullYear();

  const [rows, accounts] = await Promise.all([
    listIncomeFiltered({
    year,
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
      <h1 className="mb-4 text-xl font-bold text-slate-800">Income — {year}</h1>
      <FilterBar basePath="/income" year={year} values={sp} accounts={accounts} />
      <IncomeTable rows={rows} year={year} accounts={accounts} />
    </div>
  );
}
