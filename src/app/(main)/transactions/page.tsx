import Link from "next/link";
import { listIncomeFiltered, listExpenseFiltered } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { BANK_ACCOUNT_LABELS, EXPENSE_CATEGORY_LABELS } from "@/lib/types";

type Row = {
  id: number;
  type: "income" | "expense";
  date: string;
  details: string;
  category?: string;
  amount: number;
  paymentMode: string;
  bankAccount: string | null;
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const year = Number(sp.year) || new Date().getFullYear();
  const type = sp.type || "";
  const from = sp.from;
  const to = sp.to;
  const search = sp.search;

  const income =
    type === "expense"
      ? []
      : (await listIncomeFiltered({ year, from, to, search })).map(
          (r): Row => ({
            id: r.id,
            type: "income",
            date: r.date,
            details: r.details,
            amount: r.amount,
            paymentMode: r.payment_mode,
            bankAccount: r.bank_account,
          })
        );

  const expense =
    type === "income"
      ? []
      : (await listExpenseFiltered({ year, from, to, search })).map(
          (r): Row => ({
            id: r.id,
            type: "expense",
            date: r.date,
            details: r.details,
            category: r.category,
            amount: r.amount,
            paymentMode: r.payment_mode,
            bankAccount: r.bank_account,
          })
        );

  const rows = [...income, ...expense].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-800">Transactions — {year}</h1>

      <form
        method="get"
        action="/transactions"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
      >
        <input type="hidden" name="year" value={year} />
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Type
          <select
            name="type"
            defaultValue={type}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          From
          <input
            type="date"
            name="from"
            defaultValue={from || ""}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          To
          <input
            type="date"
            name="to"
            defaultValue={to || ""}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Search
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
        >
          Filter
        </button>
        <a
          href={`/transactions?year=${year}`}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Reset
        </a>
      </form>

      <div className="mb-4 flex flex-wrap gap-3">
        <Link
          href={`/income?year=${year}`}
          className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700"
        >
          + Add Income
        </Link>
        <Link
          href={`/expense?year=${year}`}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700"
        >
          + Add Expense
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Sr.", "Date", "Type", "Details", "Mode", "Bank Account", "Amount"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-400">
                  No transactions found.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={`${r.type}-${r.id}`} className="hover:bg-slate-50">
                <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                <td className="px-3 py-2 whitespace-nowrap text-slate-600">
                  {formatDate(r.date)}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.type === "income"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.type === "income"
                      ? "Income"
                      : EXPENSE_CATEGORY_LABELS[r.category as "tournament" | "club"]}
                  </span>
                </td>
                <td className="px-3 py-2 max-w-[280px] truncate text-slate-700">
                  {r.details}
                </td>
                <td className="px-3 py-2 capitalize text-slate-600">{r.paymentMode}</td>
                <td className="px-3 py-2 text-slate-600">
                  {r.bankAccount
                    ? BANK_ACCOUNT_LABELS[r.bankAccount as "main" | "secretary"]
                    : "—"}
                </td>
                <td
                  className={`px-3 py-2 text-right font-semibold ${
                    r.type === "income" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {r.type === "income" ? "+" : "−"} {formatCurrency(r.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
