import { NextRequest, NextResponse } from "next/server";
import { recordAudit } from "@/lib/audit";
import {
  AccountNotFoundError,
  AccountsTableMissingError,
  getAccountById,
  parseAccountInput,
  updateAccount,
} from "@/lib/accounts";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const account = await getAccountById(Number(id));
  if (!account || account.id < 0) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }
  return NextResponse.json(account);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = parseAccountInput(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const account = await updateAccount(Number(id), parsed.value);
    await recordAudit("account", account.id, "update", account);
    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof AccountNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof AccountsTableMissingError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Could not update account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
