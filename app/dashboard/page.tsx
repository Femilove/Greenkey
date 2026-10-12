import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import DeleteListingButton from "@/components/dashboard/DeleteListingButton";
import { getOwnerListings } from "@/lib/listings";
import { formatNaira } from "@/types/property";

export const metadata = { title: "Your listings | Avenir" };

const STATUS_LABEL = {
  pending: "Pending review",
  approved: "Live",
  rejected: "Rejected",
} as const;

export default async function DashboardPage() {
  const session = await auth(); // layout already guarantees an owner is signed in
  const listings = session?.user ? await getOwnerListings(session.user.id) : [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-head">
        <h1>Your listings</h1>
        <Link className="dashboard-add-button" href="/dashboard/listings/new">
          Add a listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="dashboard-empty">
          <p>You haven&apos;t added any listings yet.</p>
          <Link className="dashboard-add-button" href="/dashboard/listings/new">
            Add your first listing
          </Link>
        </div>
      ) : (
        <div className="dashboard-listings">
          {listings.map((l) => (
            <article
              className={`dashboard-listing-card dashboard-listing-${l.status}`}
              key={l.id}
            >
              <Image
                className="dashboard-listing-image"
                src={l.image}
                alt={l.imageAlt}
                width={130}
                height={96}
              />
              <div className="dashboard-listing-body">
                <h3>{l.name}</h3>
                <p className="property-location">
                  {[l.location.area, l.location.city]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="dashboard-listing-price">
                  {formatNaira(l.price)} / night
                </p>
              </div>
              <div className="dashboard-listing-side">
                <span
                  className={`dashboard-status-pill dashboard-status-${l.status}`}
                >
                  {STATUS_LABEL[l.status ?? "pending"]}
                </span>
                <div className="dashboard-listing-actions">
                  <Link href={`/dashboard/listings/${l.id}/edit`}>Edit</Link>
                  <DeleteListingButton id={l.id} name={l.name} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
