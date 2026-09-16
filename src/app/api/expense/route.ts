import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { saveAttachment } from "@/lib/attachments";
import { listExpenseFiltered } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  if (!year) {
    return NextResponse.json({ error: "year is required" }, { status: 400 });
  }
  const rows = listExpenseFiltered({
    year,
    category: searchParams.get("category") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    paymentMode: searchParams.get("paymentMode") || undefined,
    bankAccount: searchParams.get("bankAccount") || undefined,
    transactionType: searchParams.get("transactionType") || undefined,
    search: searchParams.get("search") || undefined,
  });
  return NextResponse.json({ rows });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();

  const year = Number(form.get("year"));
  const date = String(form.get("date") || "");
  const category = String(form.get("category") || "");
  const amount = Number(form.get("amount"));
  const details = String(form.get("details") || "").trim();
  const paymentMode = String(form.get("payment_mode") || "");
  const bankAccount = (form.get("bank_account") as string) || null;
  const transactionType = (form.get("transaction_type") as string) || null;
  const transactionReference = (form.get("transaction_reference") as string) || null;
  const remarks = (form.get("remarks") as string) || null;
  const file = form.get("attachment") as File | null;

  if (
    !year ||
    !date ||
    !category ||
    !amount ||
    amount <= 0 ||
    !details ||
    !paymentMode
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (paymentMode === "bank" && !bankAccount) {
    return NextResponse.json({ error: "Bank account is required" }, { status: 400 });
  }

  let attachmentName: string | null = null;
  let attachmentPath: string | null = null;
  if (file && file.size > 0) {
    const saved = await saveAttachment("expense", year, file);
    attachmentName = saved.name;
    attachmentPath = saved.storedPath;
  }

  const db = getDb();
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO expense (year, date, category, details, amount, payment_mode, bank_account, transaction_type, transaction_reference, remarks, attachment_name, attachment_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      year,
      date,
      category,
      details,
      amount,
      paymentMode,
      paymentMode === "bank" ? bankAccount : null,
      paymentMode === "bank" ? transactionType : null,
      paymentMode === "bank" ? transactionReference : null,
      remarks,
      attachmentName,
      attachmentPath,
      now,
      now
    );

  const id = result.lastInsertRowid as number;
  const row = db.prepare(`SELECT * FROM expense WHERE id = ?`).get(id);
  recordAudit("expense", id, "create", row);

  return NextResponse.json({ id }, { status: 201 });
}
