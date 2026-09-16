import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getYearRow } from "@/lib/calculations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year: yearStr } = await params;
  const year = Number(yearStr);
  const row = getYearRow(year);
  return NextResponse.json(row);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year: yearStr } = await params;
  const year = Number(yearStr);
  const body = await req.json();
  const openingCash = Number(body.opening_cash ?? 0);
  const openingMain = Number(body.opening_main_account ?? 0);
  const openingSecretary = Number(body.opening_secretary_account ?? 0);

  if ([openingCash, openingMain, openingSecretary].some((v) => Number.isNaN(v))) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const db = getDb();
  getYearRow(year); // ensure row exists
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE years SET opening_cash = ?, opening_main_account = ?, opening_secretary_account = ?, updated_at = ?
     WHERE year = ?`
  ).run(openingCash, openingMain, openingSecretary, now, year);

  return NextResponse.json({ ok: true });
}
