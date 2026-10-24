import Link from "next/link";
import { auth } from "@/auth";
import BlockDatesForm from "@/components/dashboard/BlockDatesForm";
import RemoveBlockButton from "@/components/dashboard/RemoveBlockButton";
import { getOwnerListings } from "@/lib/listings";
import {
  getOwnerBlocks,
  getOwnerBookings,
  type OwnerBlock,
  type OwnerBooking,
} from "@/lib/ownerBookings";
import { PLATFORM_COMMISSION_PERCENT } from "@/lib/paystack";
import { formatNaira } from "@/types/property";

export const metadata = { title: "Bookings | Avenir" };
export const dynamic = "force-dynamic";

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

function BookingRow({ b, today }: { b: OwnerBooking; today: string }) {
  const staying = b.checkIn <= today && today < b.checkOut;
  return (
    <li className="owner-booking-row">
      <div className="owner-booking-dates">
        <strong>
          {fmt(b.checkIn)} &ndash; {fmt(b.checkOut)}
        </strong>
        <span>
          {b.nights} {b.nights === 1 ? "night" : "nights"}
        </span>
      </div>
      <div className="owner-booking-guest">
        <span>{b.guestEmail}</span>
        <span>
          {b.guests} {b.guests === 1 ? "guest" : "guests"}
        </span>
      </div>
      <div className="owner-booking-side">
        <strong>You receive {formatNaira(b.youReceive)}</strong>
        <span className="owner-booking-paid">
          Guest paid {formatNaira(b.amount)}
        </span>
        {b.status === "pending_payment" ? (
          <span className="owner-booking-pill owner-booking-pill-wait">
            Awaiting payment
          </span>
        ) : staying ? (
          <span className="owner-booking-pill owner-booking-pill-now">
            Staying now
          </span>
        ) : (
          <span className="owner-booking-pill owner-booking-pill-ok">
            Confirmed
          </span>
        )}
      </div>
    </li>
  );
}

function BlockRow({ b }: { b: OwnerBlock }) {
  return (
    <li className="owner-booking-row">
      <div className="owner-booking-dates">
        <strong>
          {fmt(b.checkIn)} &ndash; {fmt(b.checkOut)}
        </strong>
        <span>
          {b.nights} {b.nights === 1 ? "night" : "nights"}
        </span>
      </div>
      <div className="owner-booking-guest">
        <span>{b.note || "Blocked by you"}</span>
        <span>Not bookable on the site</span>
      </div>
      <div className="owner-booking-side">
        <span className="owner-booking-pill owner-booking-pill-block">
          Blocked by owner
        </span>
        <RemoveBlockButton id={b.id} />
      </div>
    </li>
  );
}

export default async function OwnerBookingsPage() {
  const session = await auth(); // layout already guarantees an owner is signed in
  const ownerId = session?.user?.id;
  const listings = ownerId ? await getOwnerListings(ownerId) : [];
  const bookings: OwnerBooking[] = ownerId
    ? await getOwnerBookings(ownerId)
    : [];
  const blocks: OwnerBlock[] = ownerId ? await getOwnerBlocks(ownerId) : [];

  const today = new Date().toISOString().slice(0, 10);
  const isPast = (b: OwnerBooking) => b.checkOut <= today;
  const upcomingCount = bookings.filter(
    (b) => b.checkIn > today && b.status === "confirmed",
  ).length;
  const stayingCount = bookings.filter(
    (b) => b.checkIn <= today && today < b.checkOut && b.status === "confirmed",
  ).length;
  const pastCount = bookings.filter(
    (b) => isPast(b) && b.status === "confirmed",
  ).length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-head">
        <h1>Bookings</h1>
        <Link className="dashboard-add-button" href="/dashboard">
          My listings
        </Link>
      </div>

      <div className="owner-bookings-summary">
        <div>
          <strong>{upcomingCount}</strong>
          <span>Upcoming</span>
        </div>
        <div>
          <strong>{stayingCount}</strong>
          <span>Staying now</span>
        </div>
        <div>
          <strong>{pastCount}</strong>
          <span>Past stays</span>
        </div>
      </div>

      <p className="owner-fee-notice">
        Avenir keeps {PLATFORM_COMMISSION_PERCENT}% of the stay price as its
        service commission. Guests pay the payment processing fee on top, so you
        receive the stay price minus {PLATFORM_COMMISSION_PERCENT}%. Payouts
        reach your bank on the next business day after payment.
      </p>

      {listings.length === 0 ? (
        <div className="dashboard-empty">
          <p>
            You haven&apos;t added any listings yet, so there are no bookings.
          </p>
          <Link className="dashboard-add-button" href="/dashboard/listings/new">
            Add your first listing
          </Link>
        </div>
      ) : (
        <div className="owner-booking-groups">
          {listings.map((l) => {
            const mine = bookings.filter((b) => b.listingId === l.id);
            const myBlocks = blocks.filter((b) => b.listingId === l.id);
            const current = mine.filter((b) => !isPast(b));
            const past = mine.filter(isPast).reverse(); // most recent stay first
            return (
              <section className="owner-booking-group" key={l.id}>
                <header>
                  <div>
                    <h2>{l.name}</h2>
                    <p>
                      {[l.location.area, l.location.city]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <span className="owner-booking-count">
                    {current.length} upcoming
                  </span>
                </header>

                {l.status === "approved" && <BlockDatesForm listingId={l.id} />}
                {myBlocks.length > 0 && (
                  <ul className="owner-booking-list owner-block-list">
                    {myBlocks.map((b) => (
                      <BlockRow key={b.id} b={b} />
                    ))}
                  </ul>
                )}

                {mine.length === 0 ? (
                  <p className="owner-booking-empty">
                    {l.status === "approved"
                      ? "No bookings yet. All dates are open."
                      : "Not live yet, so it can't be booked."}
                  </p>
                ) : (
                  <>
                    {current.length > 0 ? (
                      <ul className="owner-booking-list">
                        {current.map((b) => (
                          <BookingRow key={b.id} b={b} today={today} />
                        ))}
                      </ul>
                    ) : (
                      <p className="owner-booking-empty">
                        No upcoming bookings. All dates are open.
                      </p>
                    )}
                    {past.length > 0 && (
                      <details className="owner-booking-past">
                        <summary>Past bookings ({past.length})</summary>
                        <ul className="owner-booking-list">
                          {past.map((b) => (
                            <BookingRow key={b.id} b={b} today={today} />
                          ))}
                        </ul>
                      </details>
                    )}
                  </>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
