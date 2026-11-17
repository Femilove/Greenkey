import connectDB from "@/lib/mongodb";
import { PLATFORM_COMMISSION_PERCENT } from "@/lib/paystack";
import Listing from "@/models/Listing";
import User from "@/models/User";

/** The commission this owner pays: their own rate if the admin set one, otherwise the site-wide rate. */
export async function getOwnerCommissionPercent(ownerId: string): Promise<number> {
  await connectDB();
  const owner = await User.findById(ownerId).select("commissionPercent").lean<{ commissionPercent?: number }>();
  return owner?.commissionPercent ?? PLATFORM_COMMISSION_PERCENT;
}

export interface AdminOwnerRow {
  id: string;
  email: string;
  listings: number;
  commissionPercent: number | null; // null = uses the site-wide rate
}

/** Every listing owner, for the admin "Owners" page. */
export async function getOwnersForAdmin(): Promise<AdminOwnerRow[]> {
  await connectDB();
  const [owners, counts] = await Promise.all([
    User.find({ role: "owner" }).sort({ createdAt: -1 }).select("email commissionPercent").lean<{ _id: unknown; email: string; commissionPercent?: number }[]>(),
    Listing.aggregate<{ _id: unknown; n: number }>([{ $group: { _id: "$owner", n: { $sum: 1 } } }]),
  ]);
  const byOwner = new Map(counts.map((c) => [String(c._id), c.n]));
  return owners.map((o) => ({
    id: String(o._id),
    email: o.email,
    listings: byOwner.get(String(o._id)) ?? 0,
    commissionPercent: o.commissionPercent ?? null,
  }));
}
