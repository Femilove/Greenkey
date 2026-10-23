import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { OTP_MAX_ATTEMPTS, otpMatches } from "@/lib/otp";
import PendingSignup from "@/models/PendingSignup";
import User from "@/models/User";

/** Step 2 of sign-up: checks the emailed code and, if right, creates the account. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").toLowerCase().trim();
  const code = String(body?.code ?? "").trim();

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
  }

  await connectDB();
  // Count this guess first, so many parallel guesses can't each slip under the limit.
  const pending = await PendingSignup.findOneAndUpdate({ email }, { $inc: { attempts: 1 } }, { new: true });

  if (!pending || pending.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "That code has expired. Request a new one." }, { status: 400 });
  }
  if (pending.attempts > OTP_MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many wrong attempts. Request a new code." }, { status: 429 });
  }
  if (!otpMatches(email, code, pending.codeHash)) {
    const left = OTP_MAX_ATTEMPTS - pending.attempts;
    return NextResponse.json(
      { error: left > 0 ? `Incorrect code. ${left} ${left === 1 ? "attempt" : "attempts"} left.` : "Incorrect code. Request a new one." },
      { status: 400 }
    );
  }

  if (await User.exists({ email })) {
    await PendingSignup.deleteOne({ email });
    return NextResponse.json({ error: "An account with this email already exists. Sign in instead." }, { status: 409 });
  }

  await User.create({ email, passwordHash: pending.passwordHash, role: pending.role });
  await PendingSignup.deleteOne({ email });
  return NextResponse.json({ ok: true }, { status: 201 });
}
