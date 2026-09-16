import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { listYears } from "@/lib/calculations";

export async function GET() {
  const years = listYears();
  return NextResponse.json({ years });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const year = Number(body.year);
  if (!Number.isInteger(year) || year < 2000 || year > 2200) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT OR IGNORE INTO years (year, opening_cash, opening_main_account, opening_secretary_account, created_at, updated_at)
     VALUES (?, 0, 0, 0, ?, ?)`
  ).run(year, now, now);
  return NextResponse.json({ year });
}
