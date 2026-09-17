import AshokaChakra from "@/components/AshokaChakra";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  BANK_ACCOUNT_LABELS,
  ExpenseRecord,
  IncomeRecord,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/types";
import { YearSummary } from "@/lib/types";
import styles from "./balance-sheet.module.css";

export default function BalanceSheetDocument({
  year,
  summary,
  income,
  expense,
}: {
  year: number;
  summary: YearSummary;
  income: IncomeRecord[];
  expense: ExpenseRecord[];
}) {
  const tournament = expense.filter((e) => e.category === "tournament");
  const club = expense.filter((e) => e.category === "club");

  return (
    <div className={styles.page} data-balance-sheet>
      <div className={styles.outerBorder} />
      <div className={styles.innerBorder} />
      <div className={styles.cornerSwooshTop} />
      <div className={styles.cornerSwooshBottom} />
      <div className={styles.sideStripLeft} />
      <div className={styles.sideStripRight} />
      <AshokaChakra className={styles.watermark} />

      <div className={styles.content}>
        <div className={styles.headerRow}>
          <div className={styles.logoCircle}>TT</div>
          <div className={styles.headerCenter}>
            <span className={styles.clubBadge}>
              Table Tennis Players of Surendranagar
            </span>
            <div className={styles.title}>TIRANGA BALANCE SHEET</div>
            <div className={styles.subtitle}>Annual Income &amp; Expense Statement</div>
          </div>
          <div className={styles.logoCircle}>TT</div>
        </div>
        <div className={styles.ribbonWrap}>
          <span className={styles.ribbon}>Financial Year : {year}</span>
        </div>

        {/* INCOME */}
        <div className={styles.sectionBadge + " " + styles.badgeIncome}>Income</div>

        <div className={styles.summaryGrid}>
          <SummaryBox label="Cash Income" value={summary.cashIncome} />
          <SummaryBox label="Main Club A/c Income" value={summary.mainIncome} />
          <SummaryBox label="Montu Kaka A/c Income" value={summary.secretaryIncome} />
          <SummaryBox label="Total Income" value={summary.totalIncome} />
        </div>

        <IncomeTable rows={income} />

        {/* EXPENSE */}
        <div className={styles.sectionBadge + " " + styles.badgeExpenseT}>
          Tournament Expense
        </div>
        <ExpenseTable rows={tournament} variant="expTournament" />
        <TotalLine label="Total Tournament Expense" value={summary.tournamentExpense} />

        <div className={styles.sectionBadge + " " + styles.badgeExpenseC}>
          Club Expense
        </div>
        <ExpenseTable rows={club} variant="expClub" />
        <TotalLine label="Total Club Expense" value={summary.clubExpense} />

        <div className={styles.summaryGrid}>
          <SummaryBox label="Tournament Expense" value={summary.tournamentExpense} />
          <SummaryBox label="Club Expense" value={summary.clubExpense} />
          <SummaryBox label="Cash Expense" value={summary.cashExpense} />
          <SummaryBox label="Total Expense" value={summary.totalExpense} />
        </div>

        {/* BALANCE */}
        <div className={styles.sectionBadge + " " + styles.badgeBalance}>
          Balance Summary
        </div>

        <table className={styles.balanceTable}>
          <tbody>
            <tr>
              <td className={styles.label}>Opening Balance</td>
              <td className={styles.value}>{formatCurrency(summary.openingTotal)}</td>
            </tr>
            <tr>
              <td className={styles.label}>+ Total Income</td>
              <td className={styles.value}>{formatCurrency(summary.totalIncome)}</td>
            </tr>
            <tr>
              <td className={styles.label}>− Total Expense</td>
              <td className={styles.value}>{formatCurrency(summary.totalExpense)}</td>
            </tr>
            <tr className={styles.grand}>
              <td>= Closing Balance</td>
              <td className={styles.value} style={{ color: "#fff" }}>
                {formatCurrency(summary.closingTotal)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className={styles.accountGrid}>
          <AccountCard
            title="Cash Balance"
            opening={summary.openingCash}
            income={summary.cashIncome}
            expense={summary.cashExpense}
            closing={summary.closingCash}
          />
          <AccountCard
            title="Main Club Account"
            opening={summary.openingMain}
            income={summary.mainIncome}
            expense={summary.mainExpense}
            closing={summary.closingMain}
          />
          <AccountCard
            title="Montu Kaka (Secretary) A/c"
            opening={summary.openingSecretary}
            income={summary.secretaryIncome}
            expense={summary.secretaryExpense}
            closing={summary.closingSecretary}
          />
        </div>

        <div className={styles.grandTotalBar}>
          <div className={styles.grandTotalInner}>
            <span>Grand Total Closing Balance</span>
            <span className={styles.amt}>{formatCurrency(summary.closingTotal)}</span>
          </div>
        </div>

        <div className={styles.signatureRow}>
          <div className={styles.signatureBox}>
            <div className={styles.signatureLine} />
            <div className={styles.signatureRole}>President</div>
          </div>
          <div className={styles.signatureBox}>
            <div className={styles.signatureLine} />
            <div className={styles.signatureRole}>Secretary</div>
          </div>
          <div className={styles.signatureBox}>
            <div className={styles.signatureLine} />
            <div className={styles.signatureRole}>Treasurer</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.summaryBox}>
      <div className={styles.summaryBoxLabel}>{label}</div>
      <div className={styles.summaryBoxValue}>{formatCurrency(value)}</div>
    </div>
  );
}

function TotalLine({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.totalLine}>
      {label}: {formatCurrency(value)}
    </div>
  );
}

function IncomeTable({ rows }: { rows: IncomeRecord[] }) {
  const total = rows.reduce((a, r) => a + r.amount, 0);
  return (
    <table className={styles.dataTable}>
      <thead>
        <tr>
          <th style={{ width: "5%" }}>Sr.</th>
          <th style={{ width: "10%" }}>Date</th>
          <th style={{ width: "33%" }}>Details</th>
          <th style={{ width: "10%" }}>Mode</th>
          <th style={{ width: "22%" }}>Bank / Reference</th>
          <th style={{ width: "20%" }} className={styles.amountCell}>
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={6} className={styles.emptyNote}>
              No income entries recorded.
            </td>
          </tr>
        )}
        {rows.map((r, i) => (
          <tr key={r.id}>
            <td>{i + 1}</td>
            <td>{formatDate(r.date)}</td>
            <td>{r.details}</td>
            <td style={{ textTransform: "capitalize" }}>{r.payment_mode}</td>
            <td>{bankRefLabel(r)}</td>
            <td className={styles.amountCell}>{formatCurrency(r.amount)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={5}>Total Income</td>
          <td className={styles.amountCell}>{formatCurrency(total)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

function ExpenseTable({
  rows,
  variant,
}: {
  rows: ExpenseRecord[];
  variant: "expTournament" | "expClub";
}) {
  const total = rows.reduce((a, r) => a + r.amount, 0);
  return (
    <table className={`${styles.dataTable} ${styles[variant]}`}>
      <thead>
        <tr>
          <th style={{ width: "5%" }}>Sr.</th>
          <th style={{ width: "10%" }}>Date</th>
          <th style={{ width: "33%" }}>Details</th>
          <th style={{ width: "10%" }}>Mode</th>
          <th style={{ width: "22%" }}>Bank / Reference</th>
          <th style={{ width: "20%" }} className={styles.amountCell}>
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={6} className={styles.emptyNote}>
              No entries recorded.
            </td>
          </tr>
        )}
        {rows.map((r, i) => (
          <tr key={r.id}>
            <td>{i + 1}</td>
            <td>{formatDate(r.date)}</td>
            <td>{r.details}</td>
            <td style={{ textTransform: "capitalize" }}>{r.payment_mode}</td>
            <td>{bankRefLabel(r)}</td>
            <td className={styles.amountCell}>{formatCurrency(r.amount)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={5}>Subtotal</td>
          <td className={styles.amountCell}>{formatCurrency(total)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

function bankRefLabel(r: IncomeRecord | ExpenseRecord): string {
  if (r.payment_mode === "cash") return "Cash";
  const parts: string[] = [];
  if (r.bank_account) parts.push(BANK_ACCOUNT_LABELS[r.bank_account]);
  if (r.transaction_type) parts.push(TRANSACTION_TYPE_LABELS[r.transaction_type]);
  if (r.transaction_reference) parts.push(r.transaction_reference);
  return parts.join(" · ") || "—";
}

function AccountCard({
  title,
  opening,
  income,
  expense,
  closing,
}: {
  title: string;
  opening: number;
  income: number;
  expense: number;
  closing: number;
}) {
  return (
    <div className={styles.accountCard}>
      <div className={styles.accountCardTitle}>{title}</div>
      <div className={styles.accountCardRow}>
        <span>Opening</span>
        <span>{formatCurrency(opening)}</span>
      </div>
      <div className={styles.accountCardRow}>
        <span>+ Income</span>
        <span>{formatCurrency(income)}</span>
      </div>
      <div className={styles.accountCardRow}>
        <span>− Expense</span>
        <span>{formatCurrency(expense)}</span>
      </div>
      <div className={`${styles.accountCardRow} ${styles.total}`}>
        <span>Closing</span>
        <span>{formatCurrency(closing)}</span>
      </div>
    </div>
  );
}
