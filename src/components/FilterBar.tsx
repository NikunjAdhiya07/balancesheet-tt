import {
  BANK_ACCOUNT_LABELS,
  BankAccount,
  EXPENSE_CATEGORY_LABELS,
  ExpenseCategory,
  TRANSACTION_TYPE_LABELS,
  TransactionType,
} from "@/lib/types";

export default function FilterBar({
  basePath,
  year,
  showCategory,
  values,
}: {
  basePath: string;
  year: number;
  showCategory?: boolean;
  values: {
    category?: string;
    from?: string;
    to?: string;
    paymentMode?: string;
    bankAccount?: string;
    transactionType?: string;
    search?: string;
  };
}) {
  return (
    <form
      method="get"
      action={basePath}
      className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <input type="hidden" name="year" value={year} />

      {showCategory && (
        <Field label="Category">
          <select name="category" defaultValue={values.category || ""} className={selectCls}>
            <option value="">All</option>
            {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((c) => (
              <option key={c} value={c}>
                {EXPENSE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="From">
        <input type="date" name="from" defaultValue={values.from || ""} className={inputCls} />
      </Field>
      <Field label="To">
        <input type="date" name="to" defaultValue={values.to || ""} className={inputCls} />
      </Field>
      <Field label="Mode">
        <select name="paymentMode" defaultValue={values.paymentMode || ""} className={selectCls}>
          <option value="">All</option>
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
        </select>
      </Field>
      <Field label="Bank Account">
        <select name="bankAccount" defaultValue={values.bankAccount || ""} className={selectCls}>
          <option value="">All</option>
          {(Object.keys(BANK_ACCOUNT_LABELS) as BankAccount[]).map((k) => (
            <option key={k} value={k}>
              {BANK_ACCOUNT_LABELS[k]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Txn Type">
        <select
          name="transactionType"
          defaultValue={values.transactionType || ""}
          className={selectCls}
        >
          <option value="">All</option>
          {(Object.keys(TRANSACTION_TYPE_LABELS) as TransactionType[]).map((t) => (
            <option key={t} value={t}>
              {TRANSACTION_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Search">
        <input
          type="text"
          name="search"
          defaultValue={values.search || ""}
          placeholder="Details, remarks, reference..."
          className={inputCls}
        />
      </Field>

      <button
        type="submit"
        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
      >
        Filter
      </button>
      <a
        href={`${basePath}?year=${year}`}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        Reset
      </a>
    </form>
  );
}

const inputCls =
  "rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-orange-500 focus:outline-none";
const selectCls = inputCls;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      {children}
    </label>
  );
}
