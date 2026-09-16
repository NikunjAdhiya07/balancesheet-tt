import { getDb } from "./db";
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

export function listIncomeFiltered(filters: IncomeFilters): IncomeRecord[] {
  const db = getDb();
  const clauses: string[] = ["year = ?", "deleted_at IS NULL"];
  const args: unknown[] = [filters.year];

  if (filters.from) {
    clauses.push("date >= ?");
    args.push(filters.from);
  }
  if (filters.to) {
    clauses.push("date <= ?");
    args.push(filters.to);
  }
  if (filters.paymentMode) {
    clauses.push("payment_mode = ?");
    args.push(filters.paymentMode);
  }
  if (filters.bankAccount) {
    clauses.push("bank_account = ?");
    args.push(filters.bankAccount);
  }
  if (filters.transactionType) {
    clauses.push("transaction_type = ?");
    args.push(filters.transactionType);
  }
  if (filters.search) {
    clauses.push("(details LIKE ? OR remarks LIKE ? OR transaction_reference LIKE ?)");
    const like = `%${filters.search}%`;
    args.push(like, like, like);
  }

  const sql = `SELECT * FROM income WHERE ${clauses.join(" AND ")} ORDER BY date ASC, id ASC`;
  return db.prepare(sql).all(...args) as IncomeRecord[];
}

export function listExpenseFiltered(filters: ExpenseFilters): ExpenseRecord[] {
  const db = getDb();
  const clauses: string[] = ["year = ?", "deleted_at IS NULL"];
  const args: unknown[] = [filters.year];

  if (filters.category) {
    clauses.push("category = ?");
    args.push(filters.category);
  }
  if (filters.from) {
    clauses.push("date >= ?");
    args.push(filters.from);
  }
  if (filters.to) {
    clauses.push("date <= ?");
    args.push(filters.to);
  }
  if (filters.paymentMode) {
    clauses.push("payment_mode = ?");
    args.push(filters.paymentMode);
  }
  if (filters.bankAccount) {
    clauses.push("bank_account = ?");
    args.push(filters.bankAccount);
  }
  if (filters.transactionType) {
    clauses.push("transaction_type = ?");
    args.push(filters.transactionType);
  }
  if (filters.search) {
    clauses.push("(details LIKE ? OR remarks LIKE ? OR transaction_reference LIKE ?)");
    const like = `%${filters.search}%`;
    args.push(like, like, like);
  }

  const sql = `SELECT * FROM expense WHERE ${clauses.join(" AND ")} ORDER BY date ASC, id ASC`;
  return db.prepare(sql).all(...args) as ExpenseRecord[];
}

export function getIncomeById(id: number): IncomeRecord | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM income WHERE id = ?`).get(id) as
    | IncomeRecord
    | undefined;
}

export function getExpenseById(id: number): ExpenseRecord | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM expense WHERE id = ?`).get(id) as
    | ExpenseRecord
    | undefined;
}
