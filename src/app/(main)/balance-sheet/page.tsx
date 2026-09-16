import PrintFrame from "@/components/PrintFrame";
import BalanceSheetActions from "@/components/BalanceSheetActions";
import StatCard from "@/components/StatCard";
import { computeYearSummary } from "@/lib/calculations";

export default async function BalanceSheetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const year = Number(sp.year) || new Date().getFullYear();
  const s = computeYearSummary(year);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-800">
          Tiranga Balance Sheet — {year}
        </h1>
        <BalanceSheetActions year={year} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Income" value={s.totalIncome} tone="green" />
        <StatCard label="Total Expense" value={s.totalExpense} tone="red" />
        <StatCard label="Closing Balance" value={s.closingTotal} tone="orange" />
      </div>

      <p className="mb-3 text-sm text-slate-500">
        Preview below matches the exported PDF/Word layout exactly.
      </p>
      <PrintFrame src={`/print/balance-sheet?year=${year}`} />
    </div>
  );
}
