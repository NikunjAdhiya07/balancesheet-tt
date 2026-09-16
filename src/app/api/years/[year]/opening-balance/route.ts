import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getYearRow } from "@/lib/calculations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year: yearStr } = await params;
  const year = Number(yearStr);
  const row = await getYearRow(year);
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

  await getYearRow(year); // ensure row exists

  const supabase = getSupabase();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("years")
    .update({
      opening_cash: openingCash,
      opening_main_account: openingMain,
      opening_secretary_account: openingSecretary,
      updated_at: now,
    })
    .eq("year", year);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
