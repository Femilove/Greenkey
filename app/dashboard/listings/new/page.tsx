import ListingForm from "@/components/dashboard/ListingForm";
import { auth } from "@/auth";
import { getOwnerCommissionPercent } from "@/lib/commission";

export const dynamic = "force-dynamic"; // always read the owner's current rate

export const metadata = { title: "Add a listing | Avenir" };

export default async function NewListingPage() {
  const session = await auth();
  const commissionPercent = session?.user
    ? await getOwnerCommissionPercent(session.user.id)
    : undefined;
  return (
    <div className="dashboard-page">
      <h1>Add a listing</h1>
      <ListingForm mode="create" commissionPercent={commissionPercent} />
    </div>
  );
}
