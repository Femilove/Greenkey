import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import { parseListingInput, searchListings } from "@/lib/listings";
import Listing from "@/models/Listing";
import { cityFromSlug, type ListingStatus } from "@/types/property";

const int = (v: string | null) => (v && Number.parseInt(v, 10) > 0 ? Number.parseInt(v, 10) : undefined);

// Only these are real statuses in the schema — anything else in ?status= is ignored.
const REVIEW_STATUSES: ListingStatus[] = ["pending", "rejected"];
const isReviewStatus = (v: string | null): v is ListingStatus => REVIEW_STATUSES.includes(v as ListingStatus);

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const status = q.get("status"); // "pending" or "rejected" — admins reviewing listings

  if (isReviewStatus(status)) {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    await connectDB();
    const docs = await Listing.find({ status }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ listings: docs.map((d) => ({ ...d, id: String(d._id) })) });
  }

  const listings = await searchListings({
    city: cityFromSlug(q.get("location") ?? ""),
    term: q.get("type") ?? undefined,
    people: int(q.get("people")),
    rooms: int(q.get("rooms")),
    checkIn: q.get("check-in") ?? undefined,
    checkOut: q.get("check-out") ?? undefined,
  });
  return NextResponse.json({ listings });
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "owner") {
    return NextResponse.json({ error: "Only listing accounts can create listings." }, { status: 403 });
  }
  const { data, error } = parseListingInput(await req.json().catch(() => null));
  if (!data) return NextResponse.json({ error }, { status: 400 });

  await connectDB();
  // New listings wait for approval before appearing on the public site.
  const listing = await Listing.create({ ...data, owner: session.user.id, status: "pending" });
  return NextResponse.json({ id: String(listing._id), status: listing.status }, { status: 201 });
}
