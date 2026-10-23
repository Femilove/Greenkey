import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import BlockedDate from "@/models/BlockedDate";
import Booking from "@/models/Booking";
import Listing from "@/models/Listing";
import { ISO_DATE } from "@/types/property";

type Ctx = { params: Promise<{ id: string }> };

/** The owner marks dates on their own listing as taken, so guests can't book them. */
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await connectDB();
  const listing = await Listing.findById(id).select("owner");
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(listing.owner) !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) ?? {};
  const checkIn = String(body.checkIn ?? "");
  const checkOut = String(body.checkOut ?? "");
  const note = String(body.note ?? "").trim().slice(0, 100);

  if (!ISO_DATE.test(checkIn) || !ISO_DATE.test(checkOut) || checkOut <= checkIn) {
    return NextResponse.json({ error: "Choose a start date and an end date after it." }, { status: 400 });
  }
  const today = new Date().toISOString().slice(0, 10);
  if (checkIn < today) return NextResponse.json({ error: "The start date can't be in the past." }, { status: 400 });

  // Don't overlap a guest's paid booking (or one being paid for right now).
  const holdCutoff = new Date(Date.now() - 30 * 60 * 1000);
  const guestClash = await Booking.exists({
    listing: id,
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
    $or: [{ status: "confirmed" }, { status: "pending_payment", createdAt: { $gte: holdCutoff } }],
  });
  if (guestClash) {
    return NextResponse.json({ error: "A guest has already booked some of those dates. Check the list below and pick other dates." }, { status: 409 });
  }

  const blockClash = await BlockedDate.exists({ listing: id, checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } });
  if (blockClash) return NextResponse.json({ error: "Some of those dates are already blocked." }, { status: 409 });

  const created = await BlockedDate.create({ listing: id, owner: session.user.id, checkIn, checkOut, note: note || undefined });
  return NextResponse.json({ ok: true, id: String(created._id) }, { status: 201 });
}
