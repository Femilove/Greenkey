import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

/** Upgrades the signed-in user's own account to a listing (owner) account. */
export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (session.user.role === "admin") {
    return NextResponse.json({ error: "Admin accounts can't be changed to listing accounts." }, { status: 400 });
  }
  if (session.user.role === "owner") return NextResponse.json({ role: "owner" }); // already one

  await connectDB();
  const user = await User.findByIdAndUpdate(session.user.id, { role: "owner" }, { new: true });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  return NextResponse.json({ role: user.role });
}
