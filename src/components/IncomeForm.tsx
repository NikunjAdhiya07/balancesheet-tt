"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Modal from "./Modal";
import PaymentFields from "./PaymentFields";
import { BankAccount, IncomeRecord, PaymentMode, TransactionType } from "@/lib/types";
import { todayIso } from "@/lib/format";

export default function IncomeForm({
  year,
  existing,
  onClose,
}: {
  year: number;
  existing?: IncomeRecord;
  onClose: () => void;
}) {
  const router = useRouter();
  const [date, setDate] = useState(existing?.date || todayIso());
  const [amount, setAmount] = useState(existing?.amount ? String(existing.amount) : "");
  const [details, setDetails] = useState(existing?.details || "");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    existing?.payment_mode || "cash"
  );
  const [bankAccount, setBankAccount] = useState<BankAccount | "">(
    existing?.bank_account || ""
  );
  const [transactionType, setTransactionType] = useState<TransactionType | "">(
    existing?.transaction_type || ""
  );
  const [transactionReference, setTransactionReference] = useState(
    existing?.transaction_reference || ""
  );
  const [remarks, setRemarks] = useState(existing?.remarks || "");
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (paymentMode === "bank" && !bankAccount) {
      setError("Please select a bank account.");
      return;
    }
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("year", String(year));
    if (removeAttachment) formData.set("remove_attachment", "1");

    try {
      const url = existing ? `/api/income/${existing.id}` : "/api/income";
      const res = await fetch(url, {
        method: existing ? "PUT" : "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save income");
      }
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={existing ? "Edit Income" : "Add Income"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Income Details / Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g. Membership fee, Donation, Sponsorship"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
          />
        </div>

        <PaymentFields
          paymentMode={paymentMode}
          setPaymentMode={setPaymentMode}
          bankAccount={bankAccount}
          setBankAccount={setBankAccount}
          transactionType={transactionType}
          setTransactionType={setTransactionType}
          transactionReference={transactionReference}
          setTransactionReference={setTransactionReference}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Remarks / Notes
          </label>
          <textarea
            name="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Attachment (optional)
          </label>
          {existing?.attachment_name && !removeAttachment ? (
            <div className="mb-2 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
              <span className="truncate text-slate-600">{existing.attachment_name}</span>
              <button
                type="button"
                onClick={() => setRemoveAttachment(true)}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : null}
          <input
            type="file"
            name="attachment"
            className="w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-orange-700 hover:file:bg-orange-100"
          />
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Income"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
