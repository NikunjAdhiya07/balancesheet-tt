"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ExpenseForm from "./ExpenseForm";
import ConfirmDialog from "./ConfirmDialog";
import Modal from "./Modal";
import {
  BANK_ACCOUNT_LABELS,
  EXPENSE_CATEGORY_LABELS,
  ExpenseRecord,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

export default function ExpenseTable({
  rows,
  year,
}: {
  rows: ExpenseRecord[];
  year: number;
}) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ExpenseRecord | null>(null);
  const [viewing, setViewing] = useState<ExpenseRecord | null>(null);
  const [deleting, setDeleting] = useState<ExpenseRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const totalTournament = rows
    .filter((r) => r.category === "tournament")
    .reduce((a, r) => a + r.amount, 0);
  const totalClub = rows
    .filter((r) => r.category === "club")
    .reduce((a, r) => a + r.amount, 0);
  const total = totalTournament + totalClub;

  async function handleDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await fetch(`/api/expense/${deleting.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2">
            <span className="text-xs font-medium uppercase text-red-700">
              Total Expense ({year})
            </span>
            <div className="text-xl font-bold text-red-800">{formatCurrency(total)}</div>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2">
            <span className="text-xs font-medium uppercase text-orange-700">
              Tournament
            </span>
            <div className="text-lg font-bold text-orange-800">
              {formatCurrency(totalTournament)}
            </div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
            <span className="text-xs font-medium uppercase text-blue-700">Club</span>
            <div className="text-lg font-bold text-blue-800">
              {formatCurrency(totalClub)}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700"
        >
          + Add Expense
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Sr.",
                "Date",
                "Category",
                "Details",
                "Amount",
                "Mode",
                "Bank Account",
                "Txn Type",
                "Reference",
                "Remarks",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={11} className="px-3 py-8 text-center text-slate-400">
                  No expense records yet for {year}.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                <td className="px-3 py-2 whitespace-nowrap text-slate-600">
                  {formatDate(r.date)}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.category === "tournament"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {EXPENSE_CATEGORY_LABELS[r.category]}
                  </span>
                </td>
                <td className="px-3 py-2 max-w-[200px] truncate text-slate-700">
                  {r.details}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-slate-800">
                  {formatCurrency(r.amount)}
                </td>
                <td className="px-3 py-2 capitalize text-slate-600">{r.payment_mode}</td>
                <td className="px-3 py-2 text-slate-600">
                  {r.bank_account ? BANK_ACCOUNT_LABELS[r.bank_account] : "—"}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {r.transaction_type ? TRANSACTION_TYPE_LABELS[r.transaction_type] : "—"}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {r.transaction_reference || "—"}
                </td>
                <td className="px-3 py-2 max-w-[140px] truncate text-slate-500">
                  {r.remarks || "—"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewing(r)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setEditing(r)}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleting(r)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <ExpenseForm year={year} onClose={() => setShowAdd(false)} />}
      {editing && (
        <ExpenseForm year={year} existing={editing} onClose={() => setEditing(null)} />
      )}
      {viewing && (
        <Modal title="Expense Details" onClose={() => setViewing(null)}>
          <dl className="space-y-2 text-sm">
            <Row label="Date" value={formatDate(viewing.date)} />
            <Row label="Category" value={EXPENSE_CATEGORY_LABELS[viewing.category]} />
            <Row label="Amount" value={formatCurrency(viewing.amount)} />
            <Row label="Details" value={viewing.details} />
            <Row label="Payment Mode" value={viewing.payment_mode} />
            {viewing.bank_account && (
              <Row label="Bank Account" value={BANK_ACCOUNT_LABELS[viewing.bank_account]} />
            )}
            {viewing.transaction_type && (
              <Row
                label="Transaction Type"
                value={TRANSACTION_TYPE_LABELS[viewing.transaction_type]}
              />
            )}
            {viewing.transaction_reference && (
              <Row label="Reference No." value={viewing.transaction_reference} />
            )}
            <Row label="Remarks" value={viewing.remarks || "—"} />
            {viewing.attachment_name && (
              <Row
                label="Attachment"
                value={
                  <a
                    href={`/api/attachments/${viewing.attachment_path}`}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    {viewing.attachment_name}
                  </a>
                }
              />
            )}
          </dl>
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          message="Are you sure you want to delete this transaction?"
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
          confirmLabel={busy ? "Deleting..." : "Delete"}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}
