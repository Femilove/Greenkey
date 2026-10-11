import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

type Ctx = { params: Promise<{ id: string }> };

/** Cancel a booking. Only the guest who made it can cancel it. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await connectDB();
  const booking = await Booking.findOne({ _id: id, user: session.user.id });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Paid bookings can't be cancelled here: cancelling wouldn't reverse the Paystack charge.
  // Bookings are non-refundable.
  if (booking.status === "confirmed") {
    return NextResponse.json({ error: "Paid bookings can't be cancelled. All payments are non-refundable." }, { status: 409 });
  }

  booking.status = "cancelled";
  await booking.save();
  return NextResponse.json({ ok: true });
}
