import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import { sampleProperties } from "@/lib/sampleProperties";
import Booking from "@/models/Booking";
import Listing from "@/models/Listing";

// Dev only: loads the sample homes into MongoDB. Visit /api/dev/seed while signed in.
// Add ?reset=1 to wipe existing listings and bookings first.
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  await connectDB();
  if (new URL(req.url).searchParams.get("reset")) {
    await Promise.all([Listing.deleteMany({}), Booking.deleteMany({})]);
  } else if (await Listing.countDocuments()) {
    return NextResponse.json({ message: "Listings already exist. Use ?reset=1 to replace them." });
  }

  let bookings = 0;
  for (const { id: _id, unavailable, ...p } of sampleProperties) {
    const doc = await Listing.create({ ...p, owner: session.user.id, status: "approved" });
    for (const r of unavailable ?? []) {
      await Booking.create({
        listing: doc._id, user: session.user.id, checkIn: r.from, checkOut: r.to,
        status: "confirmed", amount: 0, commission: 0, paystackReference: `SEED_${doc._id}_${r.from}`,
      });
      bookings++;
    }
  }
  return NextResponse.json({ listings: sampleProperties.length, bookings });
}
