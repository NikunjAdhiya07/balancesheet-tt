import { NextRequest, NextResponse } from "next/server";
import { listAccounts } from "@/lib/accounts";
import { computeYearSummary, listExpense, listIncome } from "@/lib/calculations";
import { buildBalanceSheetDocx } from "@/lib/wordExport";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year")) || new Date().getFullYear();

  const [summary, income, expense, accounts] = await Promise.all([
    computeYearSummary(year),
    listIncome(year),
    listExpense(year),
    listAccounts(),
  ]);

  const buffer = await buildBalanceSheetDocx(year, summary, income, expense, accounts);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="Tiranga-Balance-Sheet-${year}.docx"`,
    },
  });
}
