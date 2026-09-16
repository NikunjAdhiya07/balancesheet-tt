import { getSupabase } from "./supabase";
import { ExpenseRecord, IncomeRecord } from "./types";

export interface IncomeFilters {
  year: number;
  from?: string;
  to?: string;
  paymentMode?: string;
  bankAccount?: string;
  transactionType?: string;
  search?: string;
}

export interface ExpenseFilters extends IncomeFilters {
  category?: string;
}

function orValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function searchFilter(search: string, columns: string[]): string {
  const like = orValue(`%${search}%`);
  return columns.map((c) => `${c}.ilike.${like}`).join(",");
}

export async function listIncomeFiltered(filters: IncomeFilters): Promise<IncomeRecord[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("income")
    .select("*")
    .eq("year", filters.year)
    .is("deleted_at", null)
    .order("date", { ascending: true })
    .order("id", { ascending: true });

  if (filters.from) query = query.gte("date", filters.from);
  if (filters.to) query = query.lte("date", filters.to);
  if (filters.paymentMode) query = query.eq("payment_mode", filters.paymentMode);
  if (filters.bankAccount) query = query.eq("bank_account", filters.bankAccount);
  if (filters.transactionType) query = query.eq("transaction_type", filters.transactionType);
  if (filters.search) {
    query = query.or(searchFilter(filters.search, ["details", "remarks", "transaction_reference"]));
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as IncomeRecord[];
}

export async function listExpenseFiltered(filters: ExpenseFilters): Promise<ExpenseRecord[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("expense")
    .select("*")
    .eq("year", filters.year)
    .is("deleted_at", null)
    .order("date", { ascending: true })
    .order("id", { ascending: true });

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.from) query = query.gte("date", filters.from);
  if (filters.to) query = query.lte("date", filters.to);
  if (filters.paymentMode) query = query.eq("payment_mode", filters.paymentMode);
  if (filters.bankAccount) query = query.eq("bank_account", filters.bankAccount);
  if (filters.transactionType) query = query.eq("transaction_type", filters.transactionType);
  if (filters.search) {
    query = query.or(searchFilter(filters.search, ["details", "remarks", "transaction_reference"]));
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ExpenseRecord[];
}

export async function getIncomeById(id: number): Promise<IncomeRecord | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("income").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? undefined) as IncomeRecord | undefined;
}

export async function getExpenseById(id: number): Promise<ExpenseRecord | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("expense").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? undefined) as ExpenseRecord | undefined;
}
