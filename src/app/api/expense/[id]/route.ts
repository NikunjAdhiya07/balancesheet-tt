import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { deleteAttachment, saveAttachment } from "@/lib/attachments";
import { getExpenseById } from "@/lib/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const row = getExpenseById(Number(id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const existing = getExpenseById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
  const removeAttachment = form.get("remove_attachment") === "1";

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

  let attachmentName = existing.attachment_name;
  let attachmentPath = existing.attachment_path;

  if (file && file.size > 0) {
    deleteAttachment(existing.attachment_path);
    const saved = await saveAttachment("expense", year, file);
    attachmentName = saved.name;
    attachmentPath = saved.storedPath;
  } else if (removeAttachment) {
    deleteAttachment(existing.attachment_path);
    attachmentName = null;
    attachmentPath = null;
  }

  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE expense SET year=?, date=?, category=?, details=?, amount=?, payment_mode=?, bank_account=?, transaction_type=?, transaction_reference=?, remarks=?, attachment_name=?, attachment_path=?, updated_at=?
     WHERE id = ?`
  ).run(
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
    id
  );

  const updated = db.prepare(`SELECT * FROM expense WHERE id = ?`).get(id);
  recordAudit("expense", id, "update", { before: existing, after: updated });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const existing = getExpenseById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`UPDATE expense SET deleted_at = ? WHERE id = ?`).run(now, id);
  recordAudit("expense", id, "delete", existing);

  return NextResponse.json({ ok: true });
}
