import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import CancelBookingButton from "@/components/CancelBookingButton";
import { getUserBookings, type BookingWithListing } from "@/lib/listings";
import { formatNaira, nightsBetween } from "@/types/property";

export const metadata = { title: "Bookings | Avenir" };

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

type Phase = "awaiting_payment" | "upcoming" | "completed" | "cancelled";
const HOLD_MS = 30 * 60 * 1000; // matches the soft-hold window in lib/listings.ts

const phaseOf = (b: BookingWithListing, today: string): Phase => {
  if (b.status === "cancelled") return "cancelled";
  if (b.status === "pending_payment") {
    // Older than the hold window means the checkout was abandoned, treat it like it never happened.
    return Date.now() - Date.parse(b.createdAt) < HOLD_MS
      ? "awaiting_payment"
      : "cancelled";
  }
  return b.checkOut < today ? "completed" : "upcoming";
};

export default async function BookingsPage() {
  const session = await auth(); // middleware already guarantees this, but keeps TS and safety happy
  const bookings = session?.user ? await getUserBookings(session.user.id) : [];
  const today = new Date().toISOString().slice(0, 10);

  const groups: { phase: Phase; title: string }[] = [
    { phase: "awaiting_payment", title: "Awaiting payment" },
    { phase: "upcoming", title: "Upcoming stays" },
    { phase: "completed", title: "Past stays" },
    { phase: "cancelled", title: "Cancelled" },
  ];

  return (
    <div className="bookings-page">
      <Link className="back-link" href="/">
        &larr; Back to homes
      </Link>
      <h1>Your bookings</h1>

      {bookings.length === 0 ? (
        <div className="bookings-empty">
          <p>You have no bookings yet.</p>
          <Link className="bookings-empty-cta" href="/homes">
            Find a home to book
          </Link>
        </div>
      ) : (
        groups.map(({ phase, title }) => {
          const items = bookings.filter((b) => phaseOf(b, today) === phase);
          if (items.length === 0) return null;
          return (
            <section className="booking-group" key={phase} aria-label={title}>
              <h2>{title}</h2>
              <div className="bookings-list">
                {items.map((b) => (
                  <article
                    className={`booking-card booking-card-${phase}`}
                    key={b.id}
                  >
                    {b.listing ? (
                      <Image
                        className="booking-card-image"
                        src={b.listing.image}
                        unoptimized={b.listing.image.endsWith(".gif")}
                        alt={b.listing.imageAlt || b.listing.name}
                        width={160}
                        height={120}
                      />
                    ) : (
                      <div
                        className="booking-card-image booking-card-missing"
                        aria-hidden="true"
                      />
                    )}

                    <div className="booking-card-body">
                      <h3>
                        {b.listing?.name ?? "Listing no longer available"}
                      </h3>
                      {b.listing && (
                        <p className="property-location">
                          {[b.listing.location.area, b.listing.location.city]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      <p className="booking-dates">
                        {shortDate(b.checkIn)} – {shortDate(b.checkOut)}
                      </p>
                      <p className="booking-meta">
                        {nightsBetween(b.checkIn, b.checkOut)}{" "}
                        {nightsBetween(b.checkIn, b.checkOut) === 1
                          ? "night"
                          : "nights"}{" "}
                        · {b.guests} {b.guests === 1 ? "guest" : "guests"} ·{" "}
                        {formatNaira(b.amount)}
                      </p>
                      {b.serviceFee > 0 && (
                        <p className="booking-meta">
                          Includes {formatNaira(b.serviceFee)} payment
                          processing fee
                        </p>
                      )}
                    </div>

                    <div className="booking-card-side">
                      <span className={`booking-pill booking-pill-${phase}`}>
                        {phase === "awaiting_payment"
                          ? "Awaiting payment"
                          : phase === "upcoming"
                            ? "Upcoming"
                            : phase === "completed"
                              ? "Completed"
                              : "Cancelled"}
                      </span>
                      {phase === "awaiting_payment" && (
                        <CancelBookingButton id={b.id} />
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
