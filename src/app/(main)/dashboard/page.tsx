import Link from "next/link";
import StatCard from "@/components/StatCard";
import OpeningBalanceEditor from "@/components/OpeningBalanceEditor";
import { computeYearSummary } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const year = Number(sp.year) || new Date().getFullYear();
  const s = computeYearSummary(year);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-800">{year} Financial Summary</h1>
        <div className="flex gap-2">
          <Link
            href={`/income?year=${year}`}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-green-700"
          >
            + Add Income
          </Link>
          <Link
            href={`/expense?year=${year}`}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700"
          >
            + Add Expense
          </Link>
          <Link
            href={`/balance-sheet?year=${year}`}
            className="rounded-lg border border-orange-300 bg-white px-4 py-2 text-sm font-bold text-orange-700 shadow-sm hover:bg-orange-50"
          >
            View Balance Sheet
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Income" value={s.totalIncome} tone="green" />
        <StatCard label="Total Expense" value={s.totalExpense} tone="red" />
        <StatCard
          label="Closing Balance"
          value={s.closingTotal}
          tone="orange"
          sub={`Opening ${formatCurrency(s.openingTotal)} + Income − Expense`}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-slate-700">Income Breakdown</h3>
          <BreakdownRow label="Cash Income" value={s.cashIncome} />
          <BreakdownRow label="Main Club Account Income" value={s.mainIncome} />
          <BreakdownRow label="Montu Kaka Account Income" value={s.secretaryIncome} />
          <BreakdownRow label="Total Income" value={s.totalIncome} bold />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-slate-700">Expense Breakdown</h3>
          <BreakdownRow label="Tournament Expense" value={s.tournamentExpense} />
          <BreakdownRow label="Club Expense" value={s.clubExpense} />
          <BreakdownRow label="Cash Expense" value={s.cashExpense} />
          <BreakdownRow label="Main Club Account Expense" value={s.mainExpense} />
          <BreakdownRow label="Montu Kaka Account Expense" value={s.secretaryExpense} />
          <BreakdownRow label="Total Expense" value={s.totalExpense} bold />
        </div>
      </div>

      <div className="mb-6">
        <OpeningBalanceEditor
          year={year}
          openingCash={s.openingCash}
          openingMain={s.openingMain}
          openingSecretary={s.openingSecretary}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-slate-700">Cash &amp; Bank Balance</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <BalanceCard
            title="Cash Balance"
            opening={s.openingCash}
            plus={s.cashIncome}
            minus={s.cashExpense}
            closing={s.closingCash}
          />
          <BalanceCard
            title="Main Club Account"
            opening={s.openingMain}
            plus={s.mainIncome}
            minus={s.mainExpense}
            closing={s.closingMain}
          />
          <BalanceCard
            title="Montu Kaka (Secretary) Account"
            opening={s.openingSecretary}
            plus={s.secretaryIncome}
            minus={s.secretaryExpense}
            closing={s.closingSecretary}
          />
        </div>
        <div className="mt-4 rounded-lg bg-slate-800 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide">
              Total Closing Balance
            </span>
            <span className="text-xl font-bold">{formatCurrency(s.closingTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between border-b border-slate-100 py-1.5 text-sm last:border-0 ${
        bold ? "font-bold text-slate-800" : "text-slate-600"
      }`}
    >
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}

function BalanceCard({
  title,
  opening,
  plus,
  minus,
  closing,
}: {
  title: string;
  opening: number;
  plus: number;
  minus: number;
  closing: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-2 text-xs font-bold uppercase text-slate-500">{title}</div>
      <div className="space-y-1 text-sm text-slate-600">
        <div className="flex justify-between">
          <span>Opening</span>
          <span>{formatCurrency(opening)}</span>
        </div>
        <div className="flex justify-between text-green-700">
          <span>+ Income</span>
          <span>{formatCurrency(plus)}</span>
        </div>
        <div className="flex justify-between text-red-700">
          <span>− Expense</span>
          <span>{formatCurrency(minus)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-800">
          <span>Closing</span>
          <span>{formatCurrency(closing)}</span>
        </div>
      </div>
    </div>
  );
}
