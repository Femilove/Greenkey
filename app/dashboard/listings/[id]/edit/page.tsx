import { notFound } from "next/navigation";
import { auth } from "@/auth";
import ListingForm from "@/components/dashboard/ListingForm";
import { getOwnedListing } from "@/lib/listings";

export const metadata = { title: "Edit listing | Greenkey" };

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

  return (
    <div className="dashboard-page">
      <h1>Edit listing</h1>
      <ListingForm mode="edit" id={listing.id} initial={listing} />
    </div>
  );
}
