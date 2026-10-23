import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import { sendEmail, signupOtpEmailHtml } from "@/lib/email";
import { generateOtp, hashOtp, OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "@/lib/otp";
import PendingSignup from "@/models/PendingSignup";
import User from "@/models/User";

/**
 * Step 1 of sign-up: checks the details and emails a 6-digit code. The account is NOT
 * created here — that happens in /api/register/verify once the code is entered.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").toLowerCase().trim();
  const password = String(body?.password ?? "");
  const role = body?.role === "owner" ? "owner" : "user"; // never accept "admin" from the client

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  await connectDB();
  if (await User.exists({ email })) {
    const message =
      role === "owner"
        ? "An account with this email already exists. Sign in, then use \"Add a rental\" to switch it to a listing account."
        : "An account with this email already exists. Sign in instead.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const existing = await PendingSignup.findOne({ email });
  if (existing) {
    const wait = OTP_RESEND_COOLDOWN_MS - (Date.now() - existing.lastSentAt.getTime());
    if (wait > 0) {
      return NextResponse.json(
        { error: `A code was just sent. Please wait ${Math.ceil(wait / 1000)} seconds before requesting another.` },
        { status: 429 }
      );
    }
  }

  const code = generateOtp();
  const now = new Date();
  await PendingSignup.findOneAndUpdate(
    { email },
    {
      email, role,
      passwordHash: await bcrypt.hash(password, 12),
      codeHash: hashOtp(email, code),
      expiresAt: new Date(now.getTime() + OTP_TTL_MS),
      attempts: 0,
      lastSentAt: now,
    },
    { upsert: true }
  );

  try {
    await sendEmail({ to: email, subject: "Your Avenir verification code", html: signupOtpEmailHtml(code) });
  } catch (err) {
    console.error("Failed to send sign-up code:", err);
    await PendingSignup.deleteOne({ email });
    return NextResponse.json({ error: "We couldn't send the verification email. Please try again in a moment." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, verify: true }, { status: 200 });
}
