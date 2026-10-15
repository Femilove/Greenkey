import Image from "next/image";
import ReviewActions from "@/components/admin/ReviewActions";
import { getListingsForReview } from "@/lib/listings";
import { formatNaira } from "@/types/property";

export const metadata = { title: "Admin review | Air" };

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default async function AdminReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: raw } = await searchParams;
  const status =
    raw === "rejected"
      ? "rejected"
      : raw === "approved"
        ? "approved"
        : "pending";
  const listings = await getListingsForReview(status);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-head">
        <h1>
          {status === "pending"
            ? "Pending listings"
            : status === "approved"
              ? "Live listings"
              : "Rejected listings"}
        </h1>
        <span className="review-count">
          {listings.length} {listings.length === 1 ? "listing" : "listings"}
        </span>
      </div>

      {listings.length === 0 ? (
        <div className="dashboard-empty">
          <p>
            {status === "pending"
              ? "Nothing waiting for review."
              : status === "approved"
                ? "No live listings."
                : "No rejected listings."}
          </p>
        </div>
      ) : (
        <div className="dashboard-listings">
          {listings.map((l) => (
            <article className="review-card" key={l.id}>
              <Image
                className="dashboard-listing-image"
                unoptimized={l.image.endsWith(".gif")}
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
                <p className="review-meta">
                  {l.bedrooms} bed · sleeps {l.maxGuests} · by {l.ownerEmail} ·
                  submitted {shortDate(l.createdAt)}
                </p>
              </div>
              <ReviewActions id={l.id} status={status} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
