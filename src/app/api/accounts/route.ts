import { NextRequest, NextResponse } from "next/server";
import { recordAudit } from "@/lib/audit";
import {
  AccountsTableMissingError,
  createAccount,
  listAccounts,
  parseAccountInput,
} from "@/lib/accounts";

export async function GET() {
  try {
    const accounts = await listAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load accounts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const parsed = parseAccountInput(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const account = await createAccount(parsed.value);
    await recordAudit("account", account.id, "create", account);
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof AccountsTableMissingError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Could not create account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
