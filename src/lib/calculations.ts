import { getSupabase } from "./supabase";
import { ExpenseRecord, IncomeRecord, YearSummary } from "./types";

function sum(rows: { amount: number }[]): number {
  return rows.reduce((acc, r) => acc + r.amount, 0);
}

export async function getYearRow(year: number) {
  const supabase = getSupabase();
  const { data: existing, error } = await supabase
    .from("years")
    .select("*")
    .eq("year", year)
    .maybeSingle();
  if (error) throw error;
  if (existing) return existing as {
    year: number;
    opening_cash: number;
    opening_main_account: number;
    opening_secretary_account: number;
  };

  const now = new Date().toISOString();
  const { error: insertError } = await supabase.from("years").upsert(
    {
      year,
      opening_cash: 0,
      opening_main_account: 0,
      opening_secretary_account: 0,
      created_at: now,
      updated_at: now,
    },
    { onConflict: "year", ignoreDuplicates: true }
  );
  if (insertError) throw insertError;

  return { year, opening_cash: 0, opening_main_account: 0, opening_secretary_account: 0 };
}

export async function listIncome(year: number): Promise<IncomeRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("income")
    .select("*")
    .eq("year", year)
    .is("deleted_at", null)
    .order("date", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []) as IncomeRecord[];
}

export async function listExpense(year: number): Promise<ExpenseRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("expense")
    .select("*")
    .eq("year", year)
    .is("deleted_at", null)
    .order("date", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ExpenseRecord[];
}

export async function computeYearSummary(year: number): Promise<YearSummary> {
  const yearRow = await getYearRow(year);
  const income = await listIncome(year);
  const expense = await listExpense(year);

  const cashIncome = sum(income.filter((r) => r.payment_mode === "cash"));
  const mainIncome = sum(
    income.filter((r) => r.payment_mode === "bank" && r.bank_account === "main")
  );
  const secretaryIncome = sum(
    income.filter((r) => r.payment_mode === "bank" && r.bank_account === "secretary")
  );
  const totalIncome = sum(income);

  const tournamentExpense = sum(expense.filter((r) => r.category === "tournament"));
  const clubExpense = sum(expense.filter((r) => r.category === "club"));
  const cashExpense = sum(expense.filter((r) => r.payment_mode === "cash"));
  const mainExpense = sum(
    expense.filter((r) => r.payment_mode === "bank" && r.bank_account === "main")
  );
  const secretaryExpense = sum(
    expense.filter((r) => r.payment_mode === "bank" && r.bank_account === "secretary")
  );
  const totalExpense = sum(expense);

  const openingCash = yearRow.opening_cash;
  const openingMain = yearRow.opening_main_account;
  const openingSecretary = yearRow.opening_secretary_account;
  const openingTotal = openingCash + openingMain + openingSecretary;

  const closingCash = openingCash + cashIncome - cashExpense;
  const closingMain = openingMain + mainIncome - mainExpense;
  const closingSecretary = openingSecretary + secretaryIncome - secretaryExpense;
  const closingTotal = closingCash + closingMain + closingSecretary;

  return {
    year,
    openingCash,
    openingMain,
    openingSecretary,
    openingTotal,
    cashIncome,
    mainIncome,
    secretaryIncome,
    totalIncome,
    tournamentExpense,
    clubExpense,
    cashExpense,
    mainExpense,
    secretaryExpense,
    totalExpense,
    closingCash,
    closingMain,
    closingSecretary,
    closingTotal,
  };
}

export async function listYears(): Promise<number[]> {
  const supabase = getSupabase();
  const [yearsRes, incomeRes, expenseRes] = await Promise.all([
    supabase.from("years").select("year"),
    supabase.from("income").select("year"),
    supabase.from("expense").select("year"),
  ]);
  if (yearsRes.error) throw yearsRes.error;
  if (incomeRes.error) throw incomeRes.error;
  if (expenseRes.error) throw expenseRes.error;

  const set = new Set<number>([
    ...(yearsRes.data ?? []).map((r) => r.year as number),
    ...(incomeRes.data ?? []).map((r) => r.year as number),
    ...(expenseRes.data ?? []).map((r) => r.year as number),
  ]);
  if (set.size === 0) {
    set.add(new Date().getFullYear());
  }
  return Array.from(set).sort((a, b) => a - b);
}
