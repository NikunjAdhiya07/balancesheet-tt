"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import { AccountRecord } from "@/lib/types";

export default function AccountForm({
  existing,
  onClose,
}: {
  existing?: AccountRecord;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(existing?.name || "");
  const [bankName, setBankName] = useState(existing?.bank_name || "");
  const [accountNumber, setAccountNumber] = useState(existing?.account_number || "");
  const [ifsc, setIfsc] = useState(existing?.ifsc || "");
  const [holderName, setHolderName] = useState(existing?.holder_name || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [isActive, setIsActive] = useState(existing?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Account name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(existing ? `/api/accounts/${existing.id}` : "/api/accounts", {
        method: existing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bank_name: bankName,
          account_number: accountNumber,
          ifsc,
          holder_name: holderName,
          notes,
          is_active: existing?.is_system ? true : isActive,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save account");
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
    <Modal title={existing ? "Edit Account" : "Add New Account"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Account name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            placeholder="Main Club Account"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Bank name">
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              maxLength={120}
              placeholder="State Bank of India"
              className={inputCls}
            />
          </Field>
          <Field label="Account holder">
            <input
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              maxLength={120}
              placeholder="Club name or person"
              className={inputCls}
            />
          </Field>
          <Field label="Account number">
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              maxLength={40}
              className={inputCls}
            />
          </Field>
          <Field label="IFSC">
            <input
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              maxLength={11}
              placeholder="SBIN0001234"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={3}
            className={inputCls}
          />
        </Field>
        {existing?.is_system ? (
          <p className="text-xs text-slate-500">
            This account is part of the balance sheet, so it stays active. You can still update its
            name and bank details.
          </p>
        ) : (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
            Active — available when recording new income and expenses
          </label>
        )}
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
            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : existing ? "Save Changes" : "Add Account"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const inputCls =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
