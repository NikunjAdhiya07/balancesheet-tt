export type PaymentMode = "cash" | "bank";
export type BankAccount = "main" | "secretary";
export type TransactionType =
  | "cheque"
  | "upi"
  | "bank_transfer"
  | "neft"
  | "rtgs"
  | "other";
export type ExpenseCategory = "tournament" | "club";

export interface IncomeRecord {
  id: number;
  year: number;
  date: string;
  amount: number;
  details: string;
  payment_mode: PaymentMode;
  bank_account: string | null;
  transaction_type: TransactionType | null;
  transaction_reference: string | null;
  remarks: string | null;
  attachment_name: string | null;
  attachment_path: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ExpenseRecord {
  id: number;
  year: number;
  date: string;
  category: ExpenseCategory;
  details: string;
  amount: number;
  payment_mode: PaymentMode;
  bank_account: string | null;
  transaction_type: TransactionType | null;
  transaction_reference: string | null;
  remarks: string | null;
  attachment_name: string | null;
  attachment_path: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AccountRecord {
  id: number;
  code: string;
  name: string;
  bank_name: string | null;
  account_number: string | null;
  ifsc: string | null;
  holder_name: string | null;
  notes: string | null;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountActivity {
  income: number;
  expense: number;
  incomeCount: number;
  expenseCount: number;
}

export interface YearRecord {
  year: number;
  opening_cash: number;
  opening_main_account: number;
  opening_secretary_account: number;
  created_at: string;
  updated_at: string;
}

export interface YearSummary {
  year: number;
  openingCash: number;
  openingMain: number;
  openingSecretary: number;
  openingTotal: number;

  cashIncome: number;
  mainIncome: number;
  secretaryIncome: number;
  otherIncome: number;
  totalIncome: number;

  tournamentExpense: number;
  clubExpense: number;
  cashExpense: number;
  mainExpense: number;
  secretaryExpense: number;
  otherExpense: number;
  totalExpense: number;

  closingCash: number;
  closingMain: number;
  closingSecretary: number;
  closingOther: number;
  closingTotal: number;
}

export const BANK_ACCOUNT_LABELS: Record<BankAccount, string> = {
  main: "Main Club Account",
  secretary: "Montu Kaka (Secretary) Account",
};

export function bankAccountLabel(
  code: string | null | undefined,
  accounts?: { code: string; name: string }[]
): string {
  if (!code) return "—";
  const fromList = accounts?.find((account) => account.code === code)?.name;
  if (fromList) return fromList;
  if (code === "main" || code === "secretary") return BANK_ACCOUNT_LABELS[code];
  return code;
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  cheque: "Cheque",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  neft: "NEFT",
  rtgs: "RTGS",
  other: "Other",
};

export const TRANSACTION_TYPE_FIELD_LABELS: Record<TransactionType, string> = {
  cheque: "Cheque No.",
  upi: "UPI Transaction ID",
  bank_transfer: "Transaction Reference No.",
  neft: "Transaction Reference No.",
  rtgs: "Transaction Reference No.",
  other: "Reference / Transaction Details",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  tournament: "Tournament Expense",
  club: "Club Expense",
};

export const TOURNAMENT_EXPENSE_SUGGESTIONS = [
  "Tournament entry fee",
  "Ground expense",
  "Referee expense",
  "Player expense",
  "Travel expense",
  "Food expense",
  "Equipment expense",
  "Accommodation",
  "Transport",
  "Prize distribution",
  "Other tournament expenses",
];

export const CLUB_EXPENSE_SUGGESTIONS = [
  "Equipment purchase",
  "Maintenance",
  "Electricity",
  "Stationery",
  "Membership-related expense",
  "Club event expense",
  "Repair expense",
  "Administrative expense",
  "Other club expenses",
];
