import { notFound } from "next/navigation";
import { auth } from "@/auth";
import ListingForm from "@/components/dashboard/ListingForm";
import { getOwnedListing } from "@/lib/listings";
import { getOwnerCommissionPercent } from "@/lib/commission";

export const dynamic = "force-dynamic"; // always read the owner's current rate

export const metadata = { title: "Edit listing | Avenir" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth(); // layout already guarantees an owner is signed in
  const listing = session?.user
    ? await getOwnedListing(id, session.user.id)
    : null;
  if (!listing) notFound();
  const commissionPercent = await getOwnerCommissionPercent(session!.user.id);

  return (
    <div className="dashboard-page">
      <h1>Edit listing</h1>
      <ListingForm
        mode="edit"
        id={listing.id}
        initial={listing}
        commissionPercent={commissionPercent}
      />
    </div>
  );
}
