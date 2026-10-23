import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { sendEmail, signupOtpEmailHtml } from "@/lib/email";
import { generateOtp, hashOtp, OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "@/lib/otp";
import PendingSignup from "@/models/PendingSignup";

/** Sends a fresh code for a sign-up that is waiting for verification (old code stops working). */
export async function POST(req: Request) {
  const email = String((await req.json().catch(() => null))?.email ?? "").toLowerCase().trim();

  await connectDB();
  const pending = await PendingSignup.findOne({ email });
  if (!pending) {
    return NextResponse.json({ error: "We couldn't find that sign-up. Please start again." }, { status: 404 });
  }

  const wait = OTP_RESEND_COOLDOWN_MS - (Date.now() - pending.lastSentAt.getTime());
  if (wait > 0) {
    return NextResponse.json({ error: `Please wait ${Math.ceil(wait / 1000)} seconds before requesting another code.` }, { status: 429 });
  }

  const code = generateOtp();
  const now = new Date();
  pending.codeHash = hashOtp(email, code);
  pending.expiresAt = new Date(now.getTime() + OTP_TTL_MS);
  pending.attempts = 0;
  pending.lastSentAt = now;
  await pending.save();

  try {
    await sendEmail({ to: email, subject: "Your Avenir verification code", html: signupOtpEmailHtml(code) });
  } catch (err) {
    console.error("Failed to resend sign-up code:", err);
    return NextResponse.json({ error: "We couldn't send the email. Please try again in a moment." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
