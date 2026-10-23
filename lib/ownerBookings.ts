import type { Types } from "mongoose";
import connectDB from "@/lib/mongodb";
import BlockedDate from "@/models/BlockedDate";
import Booking, { type IBooking } from "@/models/Booking";
import Listing from "@/models/Listing";
import "@/models/User"; // registers the User model so populate("user") works
import { nightsBetween } from "@/types/property";

export interface OwnerBooking {
  id: string;
  listingId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // the check-out day itself is free for the next guest
  nights: number;
  guests: number;
  guestEmail: string;
  amount: number; // total the guest paid, NGN
  status: "confirmed" | "pending_payment";
}

/**
 * Every booking on this owner's listings that is holding dates: paid (confirmed), or a
 * payment started in the last 30 minutes. Cancelled and abandoned checkouts are left out.
 * Soonest check-in first.
 */
export async function getOwnerBookings(ownerId: string): Promise<OwnerBooking[]> {
  await connectDB();
  const listingIds = await Listing.find({ owner: ownerId }).distinct("_id");
  if (listingIds.length === 0) return [];

  const holdCutoff = new Date(Date.now() - 30 * 60 * 1000);
  const docs = await Booking.find({
    listing: { $in: listingIds },
    $or: [{ status: "confirmed" }, { status: "pending_payment", createdAt: { $gte: holdCutoff } }],
  })
    .sort({ checkIn: 1 })
    .populate("user", "email")
    .lean<(Omit<IBooking, "user"> & { _id: Types.ObjectId; user: { email?: string } | null })[]>();

  return docs.map((b) => ({
    id: String(b._id),
    listingId: String(b.listing),
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    nights: nightsBetween(b.checkIn, b.checkOut),
    guests: b.guests,
    guestEmail: b.user?.email ?? "Guest",
    amount: b.amount ?? 0,
    status: b.status as "confirmed" | "pending_payment",
  }));
}

export interface OwnerBlock {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  note: string;
}

/** Dates this owner blocked themselves that haven't ended yet, soonest first. */
export async function getOwnerBlocks(ownerId: string): Promise<OwnerBlock[]> {
  await connectDB();
  const today = new Date().toISOString().slice(0, 10);
  const docs = await BlockedDate.find({ owner: ownerId, checkOut: { $gt: today } })
    .sort({ checkIn: 1 })
    .lean<{ _id: Types.ObjectId; listing: Types.ObjectId; checkIn: string; checkOut: string; note?: string }[]>();
  return docs.map((b) => ({
    id: String(b._id),
    listingId: String(b.listing),
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    nights: nightsBetween(b.checkIn, b.checkOut),
    note: b.note ?? "",
  }));
}
