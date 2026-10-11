import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) ?? {};
  const token = String(body.token ?? "");
  const password = String(body.password ?? "");

  if (!token) return NextResponse.json({ error: "Missing reset token." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  await connectDB();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ resetTokenHash: tokenHash, resetTokenExpiresAt: { $gt: new Date() } }).select(
    "+resetTokenHash +resetTokenExpiresAt"
  );

  if (!user) {
    return NextResponse.json({ error: "That reset link is invalid or has expired. Request a new one." }, { status: 400 });
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetTokenHash = undefined;
  user.resetTokenExpiresAt = undefined;
  await user.save();

  return NextResponse.json({ ok: true });
}
