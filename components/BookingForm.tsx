"use client";

import { FormEvent, useState } from "react";

export default function BookingForm({
  listingId,
  maxGuests,
  isLoggedIn = false,
}: {
  listingId: string;
  maxGuests: number;
  isLoggedIn?: boolean;
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) return;
    if (!checkIn || !checkOut)
      return setStatus("Choose both a check-in and a check-out date.");
    if (checkOut <= checkIn)
      return setStatus("Check-out must be after check-in.");

    setPending(true);
    setStatus("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, checkIn, checkOut, guests }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus(data?.error ?? "Could not book this home.");
        return;
      }
      // Hand off to Paystack's checkout page — the booking isn't confirmed until payment succeeds there.
      window.location.href = data.authorizationUrl;
    } catch {
      setStatus("Something went wrong. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="booking-form-row">
        <label>
          Check in
          <input
            type="date"
            min={today}
            required
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut && checkOut <= e.target.value) setCheckOut("");
            }}
          />
        </label>
        <label>
          Check out
          <input
            type="date"
            min={checkIn ? undefined : today}
            required
            value={checkOut}
            disabled={!checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </label>
        <label>
          Guests
          <input
            type="number"
            min={1}
            max={maxGuests}
            required
            value={guests}
            onChange={(e) =>
              setGuests(
                Math.min(maxGuests, Math.max(1, Number(e.target.value) || 1)),
              )
            }
          />
        </label>
      </div>
      <p className="booking-no-refunds">
        No refunds. Payments are final once made.
      </p>
      {isLoggedIn ? (
        <button className="listing-book" type="submit" disabled={pending}>
          {pending ? "Redirecting to payment…" : "Book & pay now"}
        </button>
      ) : (
        <div className="booking-signin">
          <p>Sign in or create an account to book this home.</p>
          <div className="landing-cta">
            <a
              className="landing-primary"
              href={`/login?callbackUrl=${encodeURIComponent(`/listings/${listingId}`)}`}
            >
              Sign in
            </a>
            <a
              className="landing-secondary"
              href={`/register?callbackUrl=${encodeURIComponent(`/listings/${listingId}`)}`}
            >
              Create an account
            </a>
          </div>
        </div>
      )}
      {status && (
        <p className="booking-form-status" role="status">
          {status}
        </p>
      )}
    </form>
  );
}
