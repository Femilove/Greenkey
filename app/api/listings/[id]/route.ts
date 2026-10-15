import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import { getListing, parseListingInput } from "@/lib/listings";
import Booking from "@/models/Booking";
import Listing from "@/models/Listing";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const listing = await getListing((await params).id);
  return listing ? NextResponse.json({ listing }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

/** Loads the listing and checks the signed-in user owns it. */
async function ownedListing(id: string) {
  const session = await auth();
  if (!session?.user) return { res: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  if (!isValidObjectId(id)) return { res: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  await connectDB();
  const doc = await Listing.findById(id);
  if (!doc) return { res: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (String(doc.owner) !== session.user.id) return { res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { doc };
}

export async function PUT(req: Request, { params }: Ctx) {
  const { doc, res } = await ownedListing((await params).id);
  if (!doc) return res;
  const { data, error } = parseListingInput(await req.json().catch(() => null));
  if (!data) return NextResponse.json({ error }, { status: 400 });

  doc.set({ ...data, status: "pending" }); // edits go back through approval
  await doc.save();
  return NextResponse.json({ ok: true });
}

/** Admin: approve or reject a pending listing. */
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const status = (await req.json().catch(() => null))?.status;
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: 'status must be "approved" or "rejected".' }, { status: 400 });
  }

  await connectDB();
  const doc = await Listing.findByIdAndUpdate(id, { status }, { new: true });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, status: doc.status });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  let doc;
  if (isAdmin && isValidObjectId(id)) {
    // Admins may only permanently delete listings that are already rejected (removed from the site).
    await connectDB();
    doc = await Listing.findById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (doc.status !== "rejected" && String(doc.owner) !== session?.user?.id) {
      return NextResponse.json({ error: "Reject the listing before deleting it." }, { status: 409 });
    }
  } else {
    const owned = await ownedListing(id);
    if (!owned.doc) return owned.res;
    doc = owned.doc;
  }

  const today = new Date().toISOString().slice(0, 10);
  if (await Booking.exists({ listing: doc._id, status: "confirmed", checkOut: { $gte: today } })) {
    return NextResponse.json({ error: "This listing has upcoming bookings." }, { status: 409 });
  }
  await doc.deleteOne();
  return NextResponse.json({ ok: true });
}
