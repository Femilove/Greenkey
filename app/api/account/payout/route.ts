import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import { createSubaccount, resolveAccountNumber } from "@/lib/paystack";
import User from "@/models/User";

/** The signed-in owner's current payout setup, if any. */
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "owner") return NextResponse.json({ error: "Sign in as a listing account." }, { status: 403 });

  await connectDB();
  const user = await User.findById(session.user.id).select("payoutBank paystackSubaccountCode");
  // Guard against an incomplete record left over from earlier testing/schema changes.
  const bank = user?.payoutBank;
  const payoutBank = bank?.accountNumber && bank?.bankName && bank?.accountName ? bank : null;
  return NextResponse.json({ payoutBank, hasSubaccount: !!user?.paystackSubaccountCode });
}

/** Creates (or replaces) the owner's payout bank account. Re-verifies the account number server-side either way. */
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "owner") return NextResponse.json({ error: "Sign in as a listing account." }, { status: 403 });

  const body = (await req.json().catch(() => null)) ?? {};
  const accountNumber = String(body.accountNumber ?? "").trim();
  const bankCode = String(body.bankCode ?? "").trim();
  const bankName = String(body.bankName ?? "").trim();
  const businessName = String(body.businessName ?? "").trim();

  if (!/^\d{10}$/.test(accountNumber) || !bankCode || !bankName) {
    return NextResponse.json({ error: "Enter a valid account number and choose a bank." }, { status: 400 });
  }
  if (businessName.length < 2) return NextResponse.json({ error: "Enter the name guests should see for this listing account." }, { status: 400 });

  let accountName: string;
  try {
    accountName = (await resolveAccountNumber(accountNumber, bankCode)).account_name;
  } catch {
    return NextResponse.json({ error: "Could not verify that account number. Double-check it and the bank." }, { status: 400 });
  }

  let subaccountCode: string;
  try {
    subaccountCode = (await createSubaccount({ businessName, bankCode, accountNumber })).subaccount_code;
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not set up payouts with Paystack." }, { status: 502 });
  }

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, {
    paystackSubaccountCode: subaccountCode,
    payoutBank: { bankCode, bankName, accountNumber, accountName },
  });

  return NextResponse.json({ accountName, subaccountCode }, { status: 201 });
}
