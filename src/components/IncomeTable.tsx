"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import IncomeForm from "./IncomeForm";
import ConfirmDialog from "./ConfirmDialog";
import Modal from "./Modal";
import {
  BANK_ACCOUNT_LABELS,
  IncomeRecord,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

export default function IncomeTable({
  rows,
  year,
}: {
  rows: IncomeRecord[];
  year: number;
}) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<IncomeRecord | null>(null);
  const [viewing, setViewing] = useState<IncomeRecord | null>(null);
  const [deleting, setDeleting] = useState<IncomeRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const total = rows.reduce((acc, r) => acc + r.amount, 0);

  async function handleDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await fetch(`/api/income/${deleting.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2">
          <span className="text-xs font-medium uppercase text-green-700">
            Total Income ({year})
          </span>
          <div className="text-xl font-bold text-green-800">{formatCurrency(total)}</div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700"
        >
          + Add Income
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Sr.",
                "Date",
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
                <td colSpan={10} className="px-3 py-8 text-center text-slate-400">
                  No income records yet for {year}.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                <td className="px-3 py-2 whitespace-nowrap text-slate-600">
                  {formatDate(r.date)}
                </td>
                <td className="px-3 py-2 max-w-[220px] truncate text-slate-700">
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
                <td className="px-3 py-2 max-w-[160px] truncate text-slate-500">
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

      {showAdd && <IncomeForm year={year} onClose={() => setShowAdd(false)} />}
      {editing && (
        <IncomeForm year={year} existing={editing} onClose={() => setEditing(null)} />
      )}
      {viewing && (
        <Modal title="Income Details" onClose={() => setViewing(null)}>
          <dl className="space-y-2 text-sm">
            <Row label="Date" value={formatDate(viewing.date)} />
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
                    href={viewing.attachment_path ?? undefined}
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
