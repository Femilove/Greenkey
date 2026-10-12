import { randomUUID } from "crypto";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import { appUrl } from "@/lib/appUrl";
import { getBookedRanges, getListingForCheckout, isListingAvailable } from "@/lib/listings";
import { initializeTransaction, PLATFORM_COMMISSION_PERCENT } from "@/lib/paystack";
import Booking from "@/models/Booking";
import { discountedPrice, ISO_DATE, nightsBetween } from "@/types/property";

/** The signed-in user's own bookings, soonest check-in first. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  await connectDB();
  const bookings = await Booking.find({ user: session.user.id })
    .sort({ checkIn: 1 })
    .populate("listing", "name image imageAlt location")
    .lean();
  return NextResponse.json({ bookings });
}

/**
 * Starts a paid booking. This does NOT confirm the stay. it opens a Paystack
 * transaction and returns the checkout URL to redirect the browser to. The
 * booking is only marked "confirmed" once Paystack verifies the payment
 * (see /api/webhooks/paystack and /bookings/callback).
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await req.json().catch(() => null)) ?? {};
  const listingId = String(body.listingId ?? "");
  const checkIn = String(body.checkIn ?? "");
  const checkOut = String(body.checkOut ?? "");
  const guests = Number.parseInt(body.guests, 10) || 1;

  if (!isValidObjectId(listingId)) return NextResponse.json({ error: "Invalid listing." }, { status: 400 });
  if (!ISO_DATE.test(checkIn) || !ISO_DATE.test(checkOut) || checkOut <= checkIn) {
    return NextResponse.json({ error: "Choose a valid check-in and check-out date." }, { status: 400 });
  }
  const today = new Date().toISOString().slice(0, 10);
  if (checkIn < today) return NextResponse.json({ error: "Check-in can't be in the past." }, { status: 400 });

  const checkout = await getListingForCheckout(listingId);
  if (!checkout) return NextResponse.json({ error: "This home is not available for booking." }, { status: 404 });
  const { listing, ownerSubaccountCode, ownerEmail } = checkout;

  if (!ownerSubaccountCode) {
    return NextResponse.json({ error: "This home's host hasn't finished setting up payouts yet. Try another listing." }, { status: 409 });
  }
  if (guests < 1 || guests > listing.maxGuests) {
    return NextResponse.json({ error: `This home sleeps up to ${listing.maxGuests} guests.` }, { status: 400 });
  }
  if (!(await isListingAvailable(listingId, checkIn, checkOut))) {
    const fmt = (iso: string) =>
      new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    const ranges = await getBookedRanges(listingId);
    const list = ranges.map((r) => `• ${fmt(r.from)} to ${fmt(r.to)}`).join("\n");
    return NextResponse.json(
      {
        error: ranges.length
          ? `Those dates are already booked. This home is booked on:\n${list}\nYou can check in on the day another stay ends. Please pick different dates.`
          : "Those dates are already booked. Try different dates.",
        bookedRanges: ranges,
      },
      { status: 409 }
    );
  }

  const nights = nightsBetween(checkIn, checkOut);
  const amount = discountedPrice(listing) * nights;
  const commission = Math.round(amount * (PLATFORM_COMMISSION_PERCENT / 100));
  const reference = `Avenir_${randomUUID().replace(/-/g, "")}`;

  await connectDB();
  // Created as "pending_payment" so the dates are soft-held — see isListingAvailable — while the guest pays.
  const created = await Booking.create({
    listing: listingId, user: session.user.id, checkIn, checkOut, guests,
    amount, commission, paystackReference: reference, status: "pending_payment",
  });

  // Two guests can pass the availability check above at the same moment. Whoever's booking was
  // created first (lowest _id) keeps the dates; the other backs out here.
  const holdCutoff = new Date(Date.now() - 30 * 60 * 1000);
  const earlier = await Booking.exists({
    _id: { $lt: created._id },
    listing: listingId,
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
    $or: [{ status: "confirmed" }, { status: "pending_payment", createdAt: { $gte: holdCutoff } }],
  });
  if (earlier) {
    await Booking.deleteOne({ _id: created._id });
    return NextResponse.json({ error: "Those dates were just booked by someone else. Try different dates." }, { status: 409 });
  }

  try {
    const { authorization_url } = await initializeTransaction({
      email: session.user.email,
      amountNaira: amount,
      reference,
      subaccountCode: ownerSubaccountCode,
      callbackUrl: `${appUrl(req)}/bookings/callback`,
      metadata: { listingId, ownerEmail },
    });
    return NextResponse.json({ authorizationUrl: authorization_url }, { status: 201 });
  } catch (err) {
    // Payment couldn't even start — don't leave a dead booking holding these dates.
    await Booking.deleteOne({ paystackReference: reference });
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not start payment." }, { status: 502 });
  }
}
