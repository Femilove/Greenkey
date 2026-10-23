import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import BlockedDate from "@/models/BlockedDate";

/** The owner removes a block, which frees those dates for guests again. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await connectDB();
  const block = await BlockedDate.findById(id);
  if (!block) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(block.owner) !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await block.deleteOne();
  return NextResponse.json({ ok: true });
}
