import { computeYearSummary, listIncome, listExpense } from "@/lib/calculations";
import BalanceSheetDocument from "./BalanceSheetDocument";
import AutoPrint from "@/components/AutoPrint";

export default async function BalanceSheetPrintPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const year = Number(sp.year) || new Date().getFullYear();

  const summary = await computeYearSummary(year);
  const income = await listIncome(year);
  const expense = await listExpense(year);

  return (
    <>
      <AutoPrint enabled={sp.autoprint === "1"} />
      <BalanceSheetDocument year={year} summary={summary} income={income} expense={expense} />
    </>
  );
}
