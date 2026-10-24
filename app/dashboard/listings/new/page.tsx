import ListingForm from "@/components/dashboard/ListingForm";
import { PLATFORM_COMMISSION_PERCENT } from "@/lib/paystack";

export const metadata = { title: "Add a listing | Avenir" };

export default function NewListingPage() {
  return (
    <div className="dashboard-page">
      <h1>Add a listing</h1>
      <ListingForm
        mode="create"
        commissionPercent={PLATFORM_COMMISSION_PERCENT}
      />
    </div>
  );
}
