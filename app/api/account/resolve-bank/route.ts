import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveAccountNumber } from "@/lib/paystack";

/** Looks up the account holder's name before the owner commits to saving these bank details. */
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "owner") return NextResponse.json({ error: "Sign in as a listing account." }, { status: 403 });

  const body = (await req.json().catch(() => null)) ?? {};
  const accountNumber = String(body.accountNumber ?? "").trim();
  const bankCode = String(body.bankCode ?? "").trim();
  if (!/^\d{10}$/.test(accountNumber) || !bankCode) {
    return NextResponse.json({ error: "Enter a valid 10-digit account number and choose a bank." }, { status: 400 });
  }

  try {
    const result = await resolveAccountNumber(accountNumber, bankCode);
    return NextResponse.json({ accountName: result.account_name });
  } catch (err) {
    // Paystack's own message says why (wrong account/bank pair, test-mode limit, IP restriction, bad key...).
    const reason = err instanceof Error ? err.message : "Unknown error";
    console.error("Paystack resolve account failed:", reason);
    if (reason.includes("PAYSTACK_SECRET_KEY")) {
      return NextResponse.json({ error: "Payments aren't set up on the server yet (missing Paystack key)." }, { status: 500 });
    }
    return NextResponse.json(
      { error: `Could not verify that account number. Double-check it and the bank. (${reason})` },
      { status: 400 }
    );
  }
}
