"use client";

import { useMemo, useState } from "react";
import AccountForm from "./AccountForm";
import Modal from "./Modal";
import { AccountActivity, AccountRecord } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

export default function AccountsManager({
  accounts,
  activity,
  year,
  persisted,
  openings,
}: {
  accounts: AccountRecord[];
  activity: Record<string, AccountActivity>;
  year: number;
  persisted: boolean;
  openings: { main: number; secretary: number };
}) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<AccountRecord | null>(null);
  const [viewing, setViewing] = useState<AccountRecord | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return accounts;
    return accounts.filter((account) => {
      const haystack = [
        account.name,
        account.code,
        account.bank_name,
        account.account_number,
        account.ifsc,
        account.holder_name,
        account.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [accounts, search]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-60 flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-slate-500" htmlFor="account-search">
            Search accounts
          </label>
          <input
            id="account-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, bank, holder, account number, IFSC..."
            className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {search.trim()
              ? `${filtered.length} of ${accounts.length}`
              : `${accounts.length} account${accounts.length === 1 ? "" : "s"}`}
          </span>
          <button
            onClick={() => setShowAdd(true)}
            disabled={!persisted}
            title={persisted ? undefined : "Set up the accounts table before adding accounts"}
            className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add New Account
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Account",
                "Bank",
                "Account No.",
                "Status",
                `Income ${year}`,
                `Expense ${year}`,
                `Net ${year}`,
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
                  {accounts.length === 0
                    ? "No accounts yet."
                    : "No accounts match your search."}
                </td>
              </tr>
            )}
            {filtered.map((account) => {
              const figures = activity[account.code];
              const income = figures?.income ?? 0;
              const expense = figures?.expense ?? 0;
              const net = income - expense;
              return (
                <tr key={account.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-800">{account.name}</div>
                    <div className="text-xs text-slate-500">
                      {account.holder_name || (account.is_system ? "Balance sheet account" : "—")}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{account.bank_name || "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">
                    {account.account_number || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        account.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {account.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-green-700">{formatCurrency(income)}</td>
                  <td className="px-3 py-2 text-right text-red-700">{formatCurrency(expense)}</td>
                  <td
                    className={`px-3 py-2 text-right font-semibold ${
                      net > 0 ? "text-green-700" : net < 0 ? "text-red-700" : "text-slate-700"
                    }`}
                  >
                    {formatCurrency(net)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewing(account)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setEditing(account)}
                        disabled={!persisted}
                        className="text-xs font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && <AccountForm onClose={() => setShowAdd(false)} />}
      {editing && <AccountForm existing={editing} onClose={() => setEditing(null)} />}
      {viewing && (
        <AccountDetails
          account={viewing}
          activity={activity[viewing.code]}
          year={year}
          opening={
            viewing.code === "main"
              ? openings.main
              : viewing.code === "secretary"
                ? openings.secretary
                : 0
          }
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing);
            setViewing(null);
          }}
          canEdit={persisted}
        />
      )}
    </div>
  );
}

function AccountDetails({
  account,
  activity,
  year,
  opening,
  onClose,
  onEdit,
  canEdit,
}: {
  account: AccountRecord;
  activity?: AccountActivity;
  year: number;
  opening: number;
  onClose: () => void;
  onEdit: () => void;
  canEdit: boolean;
}) {
  const income = activity?.income ?? 0;
  const expense = activity?.expense ?? 0;
  const closing = opening + income - expense;

  return (
    <Modal title="Account Details" onClose={onClose}>
      <dl className="space-y-2 text-sm">
        <Row label="Account name" value={account.name} />
        <Row label="Status" value={account.is_active ? "Active" : "Inactive"} />
        <Row label="Bank" value={account.bank_name || "—"} />
        <Row label="Account holder" value={account.holder_name || "—"} />
        <Row label="Account number" value={account.account_number || "—"} />
        <Row label="IFSC" value={account.ifsc || "—"} />
        <Row label="Notes" value={account.notes || "—"} />
        <Row label="Added" value={formatDate(account.created_at)} />
        <Row label="Last updated" value={formatDate(account.updated_at)} />
      </dl>

      <h3 className="mb-2 mt-5 text-sm font-bold text-slate-700">{year} movement</h3>
      <dl className="space-y-2 text-sm">
        <Row label="Opening balance" value={formatCurrency(opening)} />
        <Row
          label="Income"
          value={`${formatCurrency(income)} (${activity?.incomeCount ?? 0})`}
        />
        <Row
          label="Expense"
          value={`${formatCurrency(expense)} (${activity?.expenseCount ?? 0})`}
        />
        <Row label="Closing balance" value={formatCurrency(closing)} />
      </dl>
      {!account.is_system && (
        <p className="mt-3 text-xs text-slate-500">
          Additional accounts start each year at a zero opening balance. Main Club Account and the
          Secretary account use the opening balances set on the dashboard.
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Close
        </button>
        <button
          onClick={onEdit}
          disabled={!canEdit}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Edit
        </button>
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}
