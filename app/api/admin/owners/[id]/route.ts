import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const MAX_RATE = 50; // a safety limit so a typo can't give away (or take) most of a booking

/** Admin only: set an owner's own commission percentage, or clear it to use the site-wide rate. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json().catch(() => null)) ?? {};
  const raw = body.commissionPercent;
  const clear = raw === null || raw === "" || raw === undefined;
  const rate = clear ? null : Number(raw);
  if (!clear && (!Number.isFinite(rate) || rate! < 0 || rate! > MAX_RATE)) {
    return NextResponse.json({ error: `Enter a percentage between 0 and ${MAX_RATE}.` }, { status: 400 });
  }

  await connectDB();
  const owner = await User.findOne({ _id: id, role: "owner" });
  if (!owner) return NextResponse.json({ error: "Owner not found." }, { status: 404 });

  if (rate === null) owner.set("commissionPercent", undefined);
  else owner.commissionPercent = Math.round(rate * 100) / 100;
  await owner.save();
  return NextResponse.json({ ok: true, commissionPercent: owner.commissionPercent ?? null });
}
