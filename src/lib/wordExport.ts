import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { formatCurrency, formatDate } from "./format";
import {
  BANK_ACCOUNT_LABELS,
  ExpenseRecord,
  IncomeRecord,
  TRANSACTION_TYPE_LABELS,
  YearSummary,
} from "./types";

const NAVY = "0F2A52";
const ORANGE = "C2410C";
const BLUE = "1D4ED8";
const PURPLE = "6D28D9";
const GOLD = "C9922B";

function cellBorder() {
  const style = { style: BorderStyle.SINGLE, size: 4, color: "D9CBA0" };
  return { top: style, bottom: style, left: style, right: style };
}

function headerCell(text: string, color: string, widthPct: number) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: color },
    borders: cellBorder(),
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, bold: true, color: "FFFFFF", size: 16 }),
        ],
      }),
    ],
  });
}

function bodyCell(text: string, widthPct: number, align: "left" | "right" = "left", shaded?: boolean) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders: cellBorder(),
    shading: shaded ? { type: ShadingType.CLEAR, color: "auto", fill: "FBF6E9" } : undefined,
    children: [
      new Paragraph({
        alignment: align === "right" ? AlignmentType.RIGHT : AlignmentType.LEFT,
        children: [new TextRun({ text, size: 18 })],
      }),
    ],
  });
}

function bankRefLabel(r: IncomeRecord | ExpenseRecord): string {
  if (r.payment_mode === "cash") return "Cash";
  const parts: string[] = [];
  if (r.bank_account) parts.push(BANK_ACCOUNT_LABELS[r.bank_account]);
  if (r.transaction_type) parts.push(TRANSACTION_TYPE_LABELS[r.transaction_type]);
  if (r.transaction_reference) parts.push(r.transaction_reference);
  return parts.join(" · ") || "—";
}

function entriesTable(
  rows: (IncomeRecord | ExpenseRecord)[],
  headerColor: string,
  totalLabel: string
) {
  const total = rows.reduce((a, r) => a + r.amount, 0);
  const header = new TableRow({
    tableHeader: true,
    children: [
      headerCell("Sr.", headerColor, 6),
      headerCell("Date", headerColor, 11),
      headerCell("Details", headerColor, 33),
      headerCell("Mode", headerColor, 10),
      headerCell("Bank / Reference", headerColor, 22),
      headerCell("Amount", headerColor, 18),
    ],
  });

  const body = rows.map(
    (r, i) =>
      new TableRow({
        children: [
          bodyCell(String(i + 1), 6, "left", i % 2 === 1),
          bodyCell(formatDate(r.date), 11, "left", i % 2 === 1),
          bodyCell(r.details, 33, "left", i % 2 === 1),
          bodyCell(r.payment_mode, 10, "left", i % 2 === 1),
          bodyCell(bankRefLabel(r), 22, "left", i % 2 === 1),
          bodyCell(formatCurrency(r.amount), 18, "right", i % 2 === 1),
        ],
      })
  );

  const footer = new TableRow({
    children: [
      new TableCell({
        columnSpan: 5,
        width: { size: 82, type: WidthType.PERCENTAGE },
        borders: cellBorder(),
        shading: { type: ShadingType.CLEAR, color: "auto", fill: "F3E6BF" },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: totalLabel, bold: true, size: 18 })],
          }),
        ],
      }),
      new TableCell({
        width: { size: 18, type: WidthType.PERCENTAGE },
        borders: cellBorder(),
        shading: { type: ShadingType.CLEAR, color: "auto", fill: "F3E6BF" },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: formatCurrency(total), bold: true, size: 18 })],
          }),
        ],
      }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.length ? [header, ...body, footer] : [header, footer],
  });
}

function sectionHeading(text: string, color: string) {
  return new Paragraph({
    spacing: { before: 300, after: 150 },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: color },
    children: [
      new TextRun({ text: `  ${text}  `, bold: true, color: "FFFFFF", size: 22 }),
    ],
  });
}

function summaryLineTable(pairs: [string, string][], highlightLast?: boolean) {
  const rows = pairs.map(
    ([label, value], i) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            borders: cellBorder(),
            shading:
              highlightLast && i === pairs.length - 1
                ? { type: ShadingType.CLEAR, color: "auto", fill: NAVY }
                : undefined,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: label,
                    bold: highlightLast && i === pairs.length - 1,
                    color: highlightLast && i === pairs.length - 1 ? "FFFFFF" : "1E293B",
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: cellBorder(),
            shading:
              highlightLast && i === pairs.length - 1
                ? { type: ShadingType.CLEAR, color: "auto", fill: NAVY }
                : undefined,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: value,
                    bold: true,
                    color: highlightLast && i === pairs.length - 1 ? "FFFFFF" : "1E293B",
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
  );
  return new Table({ width: { size: 60, type: WidthType.PERCENTAGE }, rows });
}

export async function buildBalanceSheetDocx(
  year: number,
  summary: YearSummary,
  income: IncomeRecord[],
  expense: ExpenseRecord[]
): Promise<Buffer> {
  const tournament = expense.filter((e) => e.category === "tournament");
  const club = expense.filter((e) => e.category === "club");

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "TABLE TENNIS PLAYERS OF SURENDRANAGAR",
                bold: true,
                color: NAVY,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.TITLE,
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({ text: "TIRANGA BALANCE SHEET", bold: true, color: "B91C1C", size: 44 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `Financial Year : ${year}`, bold: true, color: GOLD, size: 24 }),
            ],
          }),
          new Paragraph({ text: "" }),

          sectionHeading("INCOME", NAVY),
          summaryLineTable([
            ["Cash Income", formatCurrency(summary.cashIncome)],
            ["Main Club Account Income", formatCurrency(summary.mainIncome)],
            ["Montu Kaka (Secretary) Account Income", formatCurrency(summary.secretaryIncome)],
            ["Total Income", formatCurrency(summary.totalIncome)],
          ]),
          new Paragraph({ text: "" }),
          entriesTable(income, NAVY, "Total Income"),

          sectionHeading("TOURNAMENT EXPENSE", ORANGE),
          entriesTable(tournament, ORANGE, "Total Tournament Expense"),

          sectionHeading("CLUB EXPENSE", BLUE),
          entriesTable(club, BLUE, "Total Club Expense"),

          new Paragraph({ text: "" }),
          summaryLineTable([
            ["Tournament Expense", formatCurrency(summary.tournamentExpense)],
            ["Club Expense", formatCurrency(summary.clubExpense)],
            ["Total Expense", formatCurrency(summary.totalExpense)],
          ]),

          sectionHeading("BALANCE SUMMARY", PURPLE),
          summaryLineTable(
            [
              ["Opening Balance", formatCurrency(summary.openingTotal)],
              ["+ Total Income", formatCurrency(summary.totalIncome)],
              ["− Total Expense", formatCurrency(summary.totalExpense)],
              ["= Closing Balance", formatCurrency(summary.closingTotal)],
            ],
            true
          ),
          new Paragraph({ text: "" }),
          summaryLineTable([
            ["Cash Balance (Closing)", formatCurrency(summary.closingCash)],
            ["Main Club Account (Closing)", formatCurrency(summary.closingMain)],
            ["Montu Kaka Account (Closing)", formatCurrency(summary.closingSecretary)],
            ["Grand Total Closing Balance", formatCurrency(summary.closingTotal)],
          ], true),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "____________________", size: 20 }),
              new TextRun({ text: "\t\t____________________", size: 20 }),
              new TextRun({ text: "\t\t____________________", size: 20 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "President", bold: true, size: 20 }),
              new TextRun({ text: "\t\t\t\tSecretary", bold: true, size: 20 }),
              new TextRun({ text: "\t\t\t\tTreasurer", bold: true, size: 20 }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
