import { NextRequest, NextResponse } from "next/server";
import { computeYearSummary, listExpense, listIncome } from "@/lib/calculations";
import { buildBalanceSheetDocx } from "@/lib/wordExport";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year")) || new Date().getFullYear();

  const summary = await computeYearSummary(year);
  const income = await listIncome(year);
  const expense = await listExpense(year);

  const buffer = await buildBalanceSheetDocx(year, summary, income, expense);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="Tiranga-Balance-Sheet-${year}.docx"`,
    },
  });
}
