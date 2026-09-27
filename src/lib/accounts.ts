import { getSupabase } from "./supabase";
import { AccountActivity, AccountRecord } from "./types";

const SYSTEM_ORDER = ["main", "secretary"];

export class AccountNotFoundError extends Error {
  constructor() {
    super("Account not found");
    this.name = "AccountNotFoundError";
  }
}

export class AccountsTableMissingError extends Error {
  constructor() {
    super(
      "The accounts table is not set up yet. Run supabase/schema.sql in the Supabase SQL editor, then refresh this page."
    );
    this.name = "AccountsTableMissingError";
  }
}

function nowIso() {
  return new Date().toISOString();
}

function fallbackAccounts(): AccountRecord[] {
  const now = nowIso();
  return [
    {
      id: -1,
      code: "main",
      name: "Main Club Account",
      bank_name: null,
      account_number: null,
      ifsc: null,
      holder_name: null,
      notes: null,
      is_active: true,
      is_system: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: -2,
      code: "secretary",
      name: "Montu Kaka (Secretary) Account",
      bank_name: null,
      account_number: null,
      ifsc: null,
      holder_name: "Montu Kaka",
      notes: null,
      is_active: true,
      is_system: true,
      created_at: now,
      updated_at: now,
    },
  ];
}

function isMissingAccountsTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /could not find the table/i.test(message) ||
    /relation ["']?accounts["']? does not exist/i.test(message)
  );
}

function sortAccounts(rows: AccountRecord[]): AccountRecord[] {
  return [...rows].sort((a, b) => {
    const ai = SYSTEM_ORDER.indexOf(a.code);
    const bi = SYSTEM_ORDER.indexOf(b.code);
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    return a.name.localeCompare(b.name);
  });
}

function toCode(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return slug || "account";
}

const REGISTRY_TYPE = "account_registry";
let tableReady = false;
let defaultsEnsured = false;

async function accountsTableReady(): Promise<boolean> {
  if (tableReady) return true;
  const supabase = getSupabase();
  const { error } = await supabase.from("accounts").select("id").limit(1);
  if (!error) {
    tableReady = true;
    return true;
  }
  if (isMissingAccountsTable(error)) return false;
  throw error;
}

async function ensureDefaultAccounts(): Promise<void> {
  const supabase = getSupabase();
  const now = nowIso();
  const { error } = await supabase.from("accounts").upsert(
    fallbackAccounts().map((account) => ({
      code: account.code,
      name: account.name,
      bank_name: account.bank_name,
      account_number: account.account_number,
      ifsc: account.ifsc,
      holder_name: account.holder_name,
      notes: account.notes,
      is_active: true,
      is_system: true,
      created_at: now,
      updated_at: now,
    })),
    { onConflict: "code", ignoreDuplicates: true }
  );
  if (error) {
    if (isMissingAccountsTable(error)) throw new AccountsTableMissingError();
    throw error;
  }
}

async function fetchAccounts(): Promise<AccountRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("accounts").select("*");
  if (error) {
    if (isMissingAccountsTable(error)) throw new AccountsTableMissingError();
    throw error;
  }
  return sortAccounts((data ?? []) as AccountRecord[]);
}

function ensureSeeds(accounts: AccountRecord[]): AccountRecord[] {
  const next = [...accounts];
  let id = next.reduce((max, account) => Math.max(max, account.id), 0);
  for (const seed of fallbackAccounts()) {
    if (!next.some((account) => account.code === seed.code)) {
      id += 1;
      next.push({ ...seed, id });
    }
  }
  return sortAccounts(next);
}

async function fetchRegistry(): Promise<AccountRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("audit_log")
    .select("snapshot")
    .eq("entity_type", REGISTRY_TYPE)
    .eq("entity_id", 0)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data?.snapshot) return [];
  try {
    const parsed = JSON.parse(data.snapshot as string) as AccountRecord[];
    return Array.isArray(parsed) ? sortAccounts(parsed) : [];
  } catch {
    return [];
  }
}

async function saveRegistry(accounts: AccountRecord[]): Promise<void> {
  const supabase = getSupabase();
  const snapshot = JSON.stringify(sortAccounts(accounts));
  const now = nowIso();
  const { data: existing, error: readError } = await supabase
    .from("audit_log")
    .select("id")
    .eq("entity_type", REGISTRY_TYPE)
    .eq("entity_id", 0)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (readError) throw readError;

  if (existing) {
    const { error } = await supabase
      .from("audit_log")
      .update({ snapshot, action: "update", changed_at: now })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("audit_log").insert({
    entity_type: REGISTRY_TYPE,
    entity_id: 0,
    action: "update",
    snapshot,
    changed_at: now,
  });
  if (error) throw error;
}

async function migrateRegistryIntoTable(): Promise<void> {
  const registry = await fetchRegistry();
  if (registry.length === 0) return;
  const supabase = getSupabase();
  const { error } = await supabase.from("accounts").upsert(
    registry.map((account) => ({
      code: account.code,
      name: account.name,
      bank_name: account.bank_name,
      account_number: account.account_number,
      ifsc: account.ifsc,
      holder_name: account.holder_name,
      notes: account.notes,
      is_active: account.is_system ? true : account.is_active,
      is_system: account.is_system,
      created_at: account.created_at,
      updated_at: account.updated_at,
    })),
    { onConflict: "code" }
  );
  if (error) throw error;
  await supabase.from("audit_log").delete().eq("entity_type", REGISTRY_TYPE).eq("entity_id", 0);
}

export async function loadAccounts(): Promise<{
  accounts: AccountRecord[];
  persisted: boolean;
  error?: string;
}> {
  if (await accountsTableReady()) {
    if (!defaultsEnsured) {
      await ensureDefaultAccounts();
      await migrateRegistryIntoTable();
      defaultsEnsured = true;
    }
    return { accounts: await fetchAccounts(), persisted: true };
  }

  const stored = await fetchRegistry();
  const accounts = ensureSeeds(stored);
  if (accounts.length !== stored.length) await saveRegistry(accounts);
  return { accounts, persisted: true };
}

export async function listAccounts(): Promise<AccountRecord[]> {
  const loaded = await loadAccounts();
  return loaded.accounts;
}

export async function getAccountById(id: number): Promise<AccountRecord | undefined> {
  const accounts = await listAccounts();
  return accounts.find((account) => account.id === id);
}

export async function getAccountByCode(code: string): Promise<AccountRecord | undefined> {
  const accounts = await listAccounts();
  return accounts.find((account) => account.code === code);
}

export async function resolveBankAccount(
  paymentMode: string,
  bankAccount: string | null,
  allowInactiveCode?: string | null
): Promise<{ ok: true; code: string | null } | { ok: false; error: string }> {
  if (paymentMode !== "bank") return { ok: true, code: null };
  const code = bankAccount?.trim() || "";
  if (!code) return { ok: false, error: "Bank account is required" };
  const account = await getAccountByCode(code);
  if (!account) return { ok: false, error: "Select a bank account from Accounts" };
  if (!account.is_active && code !== allowInactiveCode) {
    return { ok: false, error: "This bank account is inactive" };
  }
  return { ok: true, code };
}

export interface AccountInput {
  name: string;
  bank_name: string | null;
  account_number: string | null;
  ifsc: string | null;
  holder_name: string | null;
  notes: string | null;
  is_active: boolean;
}

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export function parseAccountInput(body: unknown): { ok: true; value: AccountInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid account details" };
  const record = body as Record<string, unknown>;
  const name = clean(record.name, 120);
  if (!name) return { ok: false, error: "Account name is required" };

  const ifsc = clean(record.ifsc, 11);
  if (ifsc && !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifsc)) {
    return { ok: false, error: "IFSC must be 11 characters, like SBIN0001234" };
  }

  return {
    ok: true,
    value: {
      name,
      bank_name: clean(record.bank_name, 120),
      account_number: clean(record.account_number, 40),
      ifsc: ifsc ? ifsc.toUpperCase() : null,
      holder_name: clean(record.holder_name, 120),
      notes: clean(record.notes, 500),
      is_active: record.is_active !== false,
    },
  };
}

function uniqueCode(name: string, accounts: AccountRecord[]): string {
  const existing = new Set(accounts.map((account) => account.code));
  const base = toCode(name);
  let code = base;
  let n = 2;
  while (existing.has(code)) {
    const suffix = `_${n}`;
    code = `${base.slice(0, 40 - suffix.length)}${suffix}`;
    n += 1;
  }
  return code;
}

function accountFromInput(
  input: AccountInput,
  existing: { id: number; code: string; is_system: boolean; created_at: string }
): AccountRecord {
  return {
    id: existing.id,
    code: existing.code,
    name: input.name,
    bank_name: input.bank_name,
    account_number: input.account_number,
    ifsc: input.ifsc,
    holder_name: input.holder_name,
    notes: input.notes,
    is_active: existing.is_system ? true : input.is_active,
    is_system: existing.is_system,
    created_at: existing.created_at,
    updated_at: nowIso(),
  };
}

export async function createAccount(input: AccountInput): Promise<AccountRecord> {
  const loaded = await loadAccounts();
  const now = nowIso();
  const code = uniqueCode(input.name, loaded.accounts);

  if (await accountsTableReady()) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("accounts")
      .insert({
        code,
        name: input.name,
        bank_name: input.bank_name,
        account_number: input.account_number,
        ifsc: input.ifsc,
        holder_name: input.holder_name,
        notes: input.notes,
        is_active: input.is_active,
        is_system: false,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();
    if (error) throw error;
    return data as AccountRecord;
  }

  const account: AccountRecord = {
    id: loaded.accounts.reduce((max, row) => Math.max(max, row.id), 0) + 1,
    code,
    name: input.name,
    bank_name: input.bank_name,
    account_number: input.account_number,
    ifsc: input.ifsc,
    holder_name: input.holder_name,
    notes: input.notes,
    is_active: input.is_active,
    is_system: false,
    created_at: now,
    updated_at: now,
  };
  await saveRegistry([...loaded.accounts, account]);
  return account;
}

export async function updateAccount(id: number, input: AccountInput): Promise<AccountRecord> {
  const loaded = await loadAccounts();
  const existing = loaded.accounts.find((account) => account.id === id);
  if (!existing) throw new AccountNotFoundError();
  const updated = accountFromInput(input, existing);

  if (await accountsTableReady()) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("accounts")
      .update({
        name: updated.name,
        bank_name: updated.bank_name,
        account_number: updated.account_number,
        ifsc: updated.ifsc,
        holder_name: updated.holder_name,
        notes: updated.notes,
        is_active: updated.is_active,
        updated_at: updated.updated_at,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (isMissingAccountsTable(error)) throw new AccountsTableMissingError();
      throw error;
    }
    return data as AccountRecord;
  }

  await saveRegistry(loaded.accounts.map((account) => (account.id === id ? updated : account)));
  return updated;
}

function emptyActivity(): AccountActivity {
  return { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
}

export async function accountActivity(year: number): Promise<Record<string, AccountActivity>> {
  const supabase = getSupabase();
  const [incomeRes, expenseRes] = await Promise.all([
    supabase
      .from("income")
      .select("bank_account, amount")
      .eq("year", year)
      .eq("payment_mode", "bank")
      .is("deleted_at", null),
    supabase
      .from("expense")
      .select("bank_account, amount")
      .eq("year", year)
      .eq("payment_mode", "bank")
      .is("deleted_at", null),
  ]);
  if (incomeRes.error) throw incomeRes.error;
  if (expenseRes.error) throw expenseRes.error;

  const activity: Record<string, AccountActivity> = {};
  for (const row of incomeRes.data ?? []) {
    const code = row.bank_account as string | null;
    if (!code) continue;
    const current = activity[code] ?? emptyActivity();
    current.income += Number(row.amount) || 0;
    current.incomeCount += 1;
    activity[code] = current;
  }
  for (const row of expenseRes.data ?? []) {
    const code = row.bank_account as string | null;
    if (!code) continue;
    const current = activity[code] ?? emptyActivity();
    current.expense += Number(row.amount) || 0;
    current.expenseCount += 1;
    activity[code] = current;
  }
  return activity;
}
