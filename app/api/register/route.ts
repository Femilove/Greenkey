import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

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

  await User.create({ email, passwordHash: await bcrypt.hash(password, 12), role });
  return NextResponse.json({ ok: true }, { status: 201 });
}
