import { isValidObjectId, type Types } from "mongoose";
import connectDB from "@/lib/mongodb";
import Booking, { type IBooking } from "@/models/Booking";
import Listing, { type IListing } from "@/models/Listing";
import { CITIES, MAX_PHOTOS, type City, type ListingStatus, type Property } from "@/types/property";

type Lean = IListing & { _id: Types.ObjectId };

export const toProperty = (d: Lean): Property => ({
  id: String(d._id),
  image: d.image,
  images: d.images?.length ? d.images : [d.image],
  imageAlt: d.imageAlt || d.name,
  type: d.type,
  name: d.name,
  price: d.price,
  discount: d.discount || undefined,
  location: { city: d.location.city, area: d.location.area, address: d.location.address },
  bedrooms: d.bedrooms,
  maxGuests: d.maxGuests,
  status: d.status,
});

export interface SearchFilters {
  city?: City;
  term?: string;
  people?: number;
  rooms?: number;
  checkIn?: string;
  checkOut?: string;
  limit?: number;
}

/** Approved listings matching the booking panel filters. */
export async function searchListings(f: SearchFilters = {}): Promise<Property[]> {
  await connectDB();
  const query: Record<string, unknown> = { status: "approved" };

  if (f.city) query["location.city"] = f.city;
  if (f.term) {
    const rx = new RegExp(f.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ type: rx }, { name: rx }];
  }
  if (f.people) query.maxGuests = { $gte: f.people };
  if (f.rooms) query.bedrooms = { $gte: f.rooms };

  if (f.checkIn && f.checkOut) {
    // A booking blocks the stay if the date ranges overlap — including a payment
    // started in the last 30 minutes, so two guests can't check out on the same dates at once.
    const holdCutoff = new Date(Date.now() - 30 * 60 * 1000);
    const taken = await Booking.distinct("listing", {
      checkIn: { $lt: f.checkOut },
      checkOut: { $gt: f.checkIn },
      $or: [{ status: "confirmed" }, { status: "pending_payment", createdAt: { $gte: holdCutoff } }],
    });
    if (taken.length) query._id = { $nin: taken };
  }

  const docs = await Listing.find(query).sort({ createdAt: -1 }).limit(f.limit ?? 50).lean<Lean[]>();
  return docs.map(toProperty);
}

export const getApprovedListings = (limit = 10) => searchListings({ limit });

export async function getListing(id: string): Promise<Property | null> {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const doc = await Listing.findOne({ _id: id, status: "approved" }).lean<Lean>();
  return doc ? toProperty(doc) : null;
}

export interface OwnerListing extends Property {
  status: ListingStatus;
}

/** All of an owner's listings, any status, newest first — for the dashboard table. */
export async function getOwnerListings(ownerId: string): Promise<OwnerListing[]> {
  await connectDB();
  const docs = await Listing.find({ owner: ownerId }).sort({ createdAt: -1 }).lean<Lean[]>();
  return docs.map((d) => ({ ...toProperty(d), status: d.status }));
}

/** A single listing regardless of status, but only if this owner made it. Used to prefill the edit form. */
export async function getOwnedListing(id: string, ownerId: string): Promise<OwnerListing | null> {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const doc = await Listing.findOne({ _id: id, owner: ownerId }).lean<Lean>();
  return doc ? { ...toProperty(doc), status: doc.status } : null;
}

export interface ReviewListing extends Property {
  status: ListingStatus;
  ownerEmail: string;
  createdAt: string;
}

/** Listings in a review state ("pending" or "rejected"), newest first — for the admin queue. */
export async function getListingsForReview(status: "pending" | "rejected"): Promise<ReviewListing[]> {
  await connectDB();
  const docs = await Listing.find({ status })
    .sort({ createdAt: 1 }) // oldest submissions first, so nothing waits forever
    .populate("owner", "email")
    .lean<(Lean & { createdAt: Date })[]>();

  return docs.map((d) => {
    const owner = d.owner as unknown as { email?: string } | null;
    return {
      ...toProperty(d),
      status: d.status,
      ownerEmail: owner?.email ?? "Unknown",
      createdAt: d.createdAt.toISOString(),
    };
  });
}
/** True if no confirmed (or recently-started, still-paying) booking overlaps [checkIn, checkOut). */
export async function isListingAvailable(listingId: string, checkIn: string, checkOut: string) {
  await connectDB();
  const holdCutoff = new Date(Date.now() - 30 * 60 * 1000); // abandoned checkouts stop blocking dates after 30 min
  const clash = await Booking.exists({
    listing: listingId,
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
    $or: [{ status: "confirmed" }, { status: "pending_payment", createdAt: { $gte: holdCutoff } }],
  });
  return !clash;
}

/** Upcoming date ranges already taken for a listing (confirmed, or payment started in the last 30 min), soonest first. */
export async function getBookedRanges(listingId: string, limit = 8) {
  await connectDB();
  const today = new Date().toISOString().slice(0, 10);
  const holdCutoff = new Date(Date.now() - 30 * 60 * 1000);
  const docs = await Booking.find({
    listing: listingId,
    checkOut: { $gt: today },
    $or: [{ status: "confirmed" }, { status: "pending_payment", createdAt: { $gte: holdCutoff } }],
  })
    .sort({ checkIn: 1 })
    .limit(limit)
    .select("checkIn checkOut")
    .lean<{ checkIn: string; checkOut: string }[]>();
  return docs.map((d) => ({ from: d.checkIn, to: d.checkOut }));
}

/** A listing plus what's needed to charge for it: the owner's Paystack subaccount and email. */
export async function getListingForCheckout(id: string) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const doc = await Listing.findOne({ _id: id, status: "approved" }).populate(
    "owner",
    "paystackSubaccountCode email"
  );
  if (!doc) return null;
  const owner = doc.owner as unknown as { _id: unknown; paystackSubaccountCode?: string; email: string };
  return { listing: doc, ownerSubaccountCode: owner.paystackSubaccountCode, ownerEmail: owner.email };
}

/** Validates create/update bodies. Returns clean data or an error message. */
export function parseListingInput(body: unknown) {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const num = (v: unknown) => (typeof v === "number" ? v : Number(v));
  const loc = (b.location ?? {}) as Record<string, unknown>;

  const name = str(b.name);
  const type = str(b.type).toLowerCase();
  // `images` is the full ordered list (first = cover); fall back to a single `image` for older clients.
  const images = (Array.isArray(b.images) ? b.images : [b.image]).map(str).filter(Boolean);
  const image = images[0] ?? "";
  const price = num(b.price);
  const discount = b.discount === undefined || b.discount === "" ? undefined : num(b.discount);
  const city = str(loc.city) as City;
  const bedrooms = num(b.bedrooms ?? 1);
  const maxGuests = num(b.maxGuests ?? 2);

  if (name.length < 3 || name.length > 100) return { error: "Name must be 3–100 characters." };
  if (!type) return { error: "Property type is required." };
  if (!image) return { error: "An image is required." };
  if (images.length > MAX_PHOTOS) return { error: `Add up to ${MAX_PHOTOS} photos.` };
  if (!(price > 0)) return { error: "Price must be greater than 0." };
  if (discount !== undefined && !(discount >= 0 && discount <= 90)) return { error: "Discount must be 0–90%." };
  if (!CITIES.includes(city)) return { error: `City must be one of: ${CITIES.join(", ")}.` };
  if (!Number.isInteger(bedrooms) || bedrooms < 1 || bedrooms > 20) return { error: "Bedrooms must be 1–20." };
  if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 50) return { error: "Max guests must be 1–50." };

  return {
    data: {
      name, type, image, images, price, discount, bedrooms, maxGuests,
      imageAlt: str(b.imageAlt) || name,
      location: { city, area: str(loc.area) || undefined, address: str(loc.address) || undefined },
    },
  };
}

export interface BookingWithListing {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "pending_payment" | "confirmed" | "cancelled";
  amount: number;
  createdAt: string;
  listing: { id: string; name: string; image: string; imageAlt?: string; location: Property["location"] } | null;
}

/** The signed-in user's bookings, soonest check-in first, newest cancelled ones last. */
export async function getUserBookings(userId: string): Promise<BookingWithListing[]> {
  await connectDB();
  const docs = await Booking.find({ user: userId })
    .sort({ status: 1, checkIn: 1 }) // "cancelled" sorts after "confirmed" alphabetically
    .populate("listing", "name image imageAlt location")
    .lean<(IBooking & { _id: Types.ObjectId; createdAt: Date })[]>();

  return docs.map((b) => {
    const listing = b.listing as unknown as
      | { _id: unknown; name: string; image: string; imageAlt?: string; location: Property["location"] }
      | null;
    return {
      id: String(b._id),
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      guests: b.guests,
      amount: b.amount ?? 0, // older bookings may predate the amount field
      status: b.status,
      createdAt: b.createdAt.toISOString(),
      listing: listing ? { id: String(listing._id), name: listing.name, image: listing.image, imageAlt: listing.imageAlt, location: listing.location } : null,
    };
  });
}
