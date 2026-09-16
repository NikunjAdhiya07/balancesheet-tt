"use client";

import {
  BANK_ACCOUNT_LABELS,
  BankAccount,
  PaymentMode,
  TRANSACTION_TYPE_FIELD_LABELS,
  TRANSACTION_TYPE_LABELS,
  TransactionType,
} from "@/lib/types";

const TRANSACTION_TYPES: TransactionType[] = [
  "cheque",
  "upi",
  "bank_transfer",
  "neft",
  "rtgs",
  "other",
];

export default function PaymentFields({
  paymentMode,
  setPaymentMode,
  bankAccount,
  setBankAccount,
  transactionType,
  setTransactionType,
  transactionReference,
  setTransactionReference,
}: {
  paymentMode: PaymentMode;
  setPaymentMode: (v: PaymentMode) => void;
  bankAccount: BankAccount | "";
  setBankAccount: (v: BankAccount | "") => void;
  transactionType: TransactionType | "";
  setTransactionType: (v: TransactionType | "") => void;
  transactionReference: string;
  setTransactionReference: (v: string) => void;
}) {
  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Payment Mode <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {(["cash", "bank"] as PaymentMode[]).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setPaymentMode(m)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                paymentMode === m
                  ? "border-orange-600 bg-orange-50 text-orange-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <input type="hidden" name="payment_mode" value={paymentMode} />
      </div>

      {paymentMode === "bank" && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Bank Account <span className="text-red-500">*</span>
            </label>
            <select
              name="bank_account"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value as BankAccount)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="">Select account</option>
              {(Object.keys(BANK_ACCOUNT_LABELS) as BankAccount[]).map((k) => (
                <option key={k} value={k}>
                  {BANK_ACCOUNT_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Transaction Reference Type
            </label>
            <select
              name="transaction_type"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as TransactionType)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="">Select type</option>
              {TRANSACTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TRANSACTION_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {transactionType && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {TRANSACTION_TYPE_FIELD_LABELS[transactionType]}
              </label>
              <input
                type="text"
                name="transaction_reference"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
