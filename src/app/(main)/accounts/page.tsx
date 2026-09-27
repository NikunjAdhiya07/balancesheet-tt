import AccountsManager from "@/components/AccountsManager";
import { accountActivity, loadAccounts } from "@/lib/accounts";
import { getYearRow } from "@/lib/calculations";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const year = Number(sp.year) || new Date().getFullYear();
  const [{ accounts, persisted, error }, activity, yearRow] = await Promise.all([
    loadAccounts(),
    accountActivity(year),
    getYearRow(year),
  ]);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-800">Accounts</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          View and manage every bank account available in the software. These accounts are used
          when you record bank income and expenses.
        </p>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      )}
      <AccountsManager
        accounts={accounts}
        activity={activity}
        year={year}
        persisted={persisted}
        openings={{
          main: yearRow.opening_main_account,
          secretary: yearRow.opening_secretary_account,
        }}
      />
    </div>
  );
}
