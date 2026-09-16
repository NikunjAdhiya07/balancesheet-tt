import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { listYears } from "@/lib/calculations";

export async function GET() {
  const years = await listYears();
  return NextResponse.json({ years });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const year = Number(body.year);
  if (!Number.isInteger(year) || year < 2000 || year > 2200) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const { error } = await supabase.from("years").upsert(
    {
      year,
      opening_cash: 0,
      opening_main_account: 0,
      opening_secretary_account: 0,
      created_at: now,
      updated_at: now,
    },
    { onConflict: "year", ignoreDuplicates: true }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ year });
}
