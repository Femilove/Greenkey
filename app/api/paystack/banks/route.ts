import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listBanks } from "@/lib/paystack";

/** Nigerian bank list for the payout-setup dropdown. Cached in memory for an hour — this list barely changes. */
let cache: { at: number; banks: { name: string; code: string }[] } | null = null;

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "owner") return NextResponse.json({ error: "Sign in as a listing account." }, { status: 403 });

  if (!cache || Date.now() - cache.at > 60 * 60 * 1000) {
    try {
      cache = { at: Date.now(), banks: await listBanks() };
    } catch {
      return NextResponse.json({ error: "Could not load the bank list. Try again." }, { status: 502 });
    }
  }
  return NextResponse.json({ banks: cache.banks });
}
