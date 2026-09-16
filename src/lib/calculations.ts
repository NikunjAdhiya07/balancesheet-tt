import { getDb } from "./db";
import { ExpenseRecord, IncomeRecord, YearSummary } from "./types";

function sum(rows: { amount: number }[]): number {
  return rows.reduce((acc, r) => acc + r.amount, 0);
}

export function getYearRow(year: number) {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM years WHERE year = ?`)
    .get(year) as
    | {
        year: number;
        opening_cash: number;
        opening_main_account: number;
        opening_secretary_account: number;
      }
    | undefined;
  if (row) return row;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO years (year, opening_cash, opening_main_account, opening_secretary_account, created_at, updated_at)
     VALUES (?, 0, 0, 0, ?, ?)`
  ).run(year, now, now);
  return { year, opening_cash: 0, opening_main_account: 0, opening_secretary_account: 0 };
}

export function listIncome(year: number): IncomeRecord[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM income WHERE year = ? AND deleted_at IS NULL ORDER BY date ASC, id ASC`
    )
    .all(year) as IncomeRecord[];
}

export function listExpense(year: number): ExpenseRecord[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM expense WHERE year = ? AND deleted_at IS NULL ORDER BY date ASC, id ASC`
    )
    .all(year) as ExpenseRecord[];
}

export function computeYearSummary(year: number): YearSummary {
  const yearRow = getYearRow(year);
  const income = listIncome(year);
  const expense = listExpense(year);

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

export function listYears(): number[] {
  const db = getDb();
  const fromYears = db
    .prepare(`SELECT year FROM years ORDER BY year ASC`)
    .all() as { year: number }[];
  const fromIncome = db
    .prepare(`SELECT DISTINCT year FROM income`)
    .all() as { year: number }[];
  const fromExpense = db
    .prepare(`SELECT DISTINCT year FROM expense`)
    .all() as { year: number }[];
  const set = new Set<number>([
    ...fromYears.map((r) => r.year),
    ...fromIncome.map((r) => r.year),
    ...fromExpense.map((r) => r.year),
  ]);
  if (set.size === 0) {
    set.add(new Date().getFullYear());
  }
  return Array.from(set).sort((a, b) => a - b);
}
