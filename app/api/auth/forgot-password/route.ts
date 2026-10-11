import { randomBytes, createHash } from "crypto";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { appUrl } from "@/lib/appUrl";
import { passwordResetEmailHtml, sendEmail } from "@/lib/email";
import User from "@/models/User";

const GENERIC_OK = { message: "If an account exists for that email, we've sent a reset link." };

/**
 * Always responds the same way whether or not the email exists, and whether
 * or not it's a password account, this stops someone using this form to
 * check which emails are registered.
 */
export async function POST(req: Request) {
  const email = String((await req.json().catch(() => null))?.email ?? "").toLowerCase().trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email });

  // Silently skip: no account, or an OAuth-only account with no password to reset.
  if (user?.passwordHash) {
    const rawToken = randomBytes(32).toString("hex");
    user.resetTokenHash = createHash("sha256").update(rawToken).digest("hex");
    user.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${appUrl(req)}/reset-password?token=${rawToken}`;
    await sendEmail({ to: email, subject: "Reset your Greenkey password", html: passwordResetEmailHtml(resetUrl) }).catch((err) =>
      console.error("Failed to send password reset email:", err)
    );
  }

  return NextResponse.json(GENERIC_OK);
}
