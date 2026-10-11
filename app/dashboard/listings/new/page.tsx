import ListingForm from "@/components/dashboard/ListingForm";

export const metadata = { title: "Add a listing | Greenkey" };

export default function NewListingPage() {
  return (
    <div className="dashboard-page">
      <h1>Add a listing</h1>
      <ListingForm mode="create" />
    </div>
  );
}
