import AshokaChakra from "@/components/AshokaChakra";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  ExpenseRecord,
  IncomeRecord,
  TRANSACTION_TYPE_LABELS,
  bankAccountLabel,
} from "@/lib/types";
import { YearSummary } from "@/lib/types";
import styles from "./balance-sheet.module.css";

export default function BalanceSheetDocument({
  year,
  summary,
  income,
  expense,
  accounts = [],
}: {
  year: number;
  summary: YearSummary;
  income: IncomeRecord[];
  expense: ExpenseRecord[];
  accounts?: { code: string; name: string }[];
}) {
  const tournament = expense.filter((e) => e.category === "tournament");
  const club = expense.filter((e) => e.category === "club");
  const mainName = bankAccountLabel("main", accounts);
  const secretaryName = bankAccountLabel("secretary", accounts);
  const hasOther = summary.otherIncome !== 0 || summary.otherExpense !== 0 || summary.closingOther !== 0;

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
          <img src="/logo.png" alt="" className={styles.logoMark} />
          <div className={styles.headerCenter}>
            <span className={styles.clubBadge}>
              Table Tennis Players of Surendranagar
            </span>
            <div className={styles.title}>TIRANGA BALANCE SHEET</div>
            <div className={styles.subtitle}>Annual Income &amp; Expense Statement</div>
          </div>
          <img src="/logo.png" alt="" className={styles.logoMark} />
        </div>
        <div className={styles.ribbonWrap}>
          <span className={styles.ribbon}>Financial Year : {year}</span>
        </div>

        {/* INCOME */}
        <div className={styles.sectionBadge + " " + styles.badgeIncome}>Income</div>

        <div className={styles.summaryGrid}>
          <SummaryBox label="Cash Income" value={summary.cashIncome} />
          <SummaryBox label={`${mainName} Income`} value={summary.mainIncome} />
          <SummaryBox label={`${secretaryName} Income`} value={summary.secretaryIncome} />
          {hasOther && <SummaryBox label="Other Bank Income" value={summary.otherIncome} />}
          <SummaryBox label="Total Income" value={summary.totalIncome} />
        </div>

        <IncomeTable rows={income} accounts={accounts} />

        {/* EXPENSE */}
        <div className={styles.sectionBadge + " " + styles.badgeExpenseT}>
          Tournament Expense
        </div>
        <ExpenseTable rows={tournament} variant="expTournament" accounts={accounts} />
        <TotalLine label="Total Tournament Expense" value={summary.tournamentExpense} />

        <div className={styles.sectionBadge + " " + styles.badgeExpenseC}>
          Club Expense
        </div>
        <ExpenseTable rows={club} variant="expClub" accounts={accounts} />
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
            title={mainName}
            opening={summary.openingMain}
            income={summary.mainIncome}
            expense={summary.mainExpense}
            closing={summary.closingMain}
          />
          <AccountCard
            title={secretaryName}
            opening={summary.openingSecretary}
            income={summary.secretaryIncome}
            expense={summary.secretaryExpense}
            closing={summary.closingSecretary}
          />
          {hasOther && (
            <AccountCard
              title="Other Bank Accounts"
              opening={0}
              income={summary.otherIncome}
              expense={summary.otherExpense}
              closing={summary.closingOther}
            />
          )}
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

function IncomeTable({
  rows,
  accounts,
}: {
  rows: IncomeRecord[];
  accounts?: { code: string; name: string }[];
}) {
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
            <td>{bankRefLabel(r, accounts)}</td>
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
  accounts,
}: {
  rows: ExpenseRecord[];
  variant: "expTournament" | "expClub";
  accounts?: { code: string; name: string }[];
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
            <td>{bankRefLabel(r, accounts)}</td>
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

function bankRefLabel(
  r: IncomeRecord | ExpenseRecord,
  accounts?: { code: string; name: string }[]
): string {
  const parts: string[] = [];
  if (r.payment_mode === "cash") {
    parts.push("Cash");
  } else {
    if (r.bank_account) parts.push(bankAccountLabel(r.bank_account, accounts));
    if (r.transaction_type) parts.push(TRANSACTION_TYPE_LABELS[r.transaction_type]);
    if (r.transaction_reference) parts.push(r.transaction_reference);
  }
  if (r.remarks) parts.push(r.remarks);
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
