"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

/** Lets an owner mark dates as taken (own stay, phone or cash booking) so guests can't book them. */
export default function BlockDatesForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/listings/${listingId}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkIn, checkOut, note }),
      });
      if (!res.ok) {
        setMessage({
          text:
            (await res.json().catch(() => null))?.error ??
            "Could not block those dates.",
          ok: false,
        });
        return;
      }
      setCheckIn("");
      setCheckOut("");
      setNote("");
      setMessage({
        text: "Dates blocked. Guests can no longer book them.",
        ok: true,
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="owner-block-form" onSubmit={submit}>
      <p className="owner-block-title">
        Block dates (your own stay or an offline booking)
      </p>
      <div className="owner-block-fields">
        <label>
          From
          <input
            type="date"
            value={checkIn}
            min={today}
            required
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </label>
        <label>
          Until (check-out day)
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            required
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </label>
        <label className="owner-block-note">
          Note (optional)
          <input
            type="text"
            value={note}
            maxLength={100}
            placeholder="e.g. Family visit"
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <button type="submit" disabled={pending}>
          {pending ? "Blocking…" : "Block dates"}
        </button>
      </div>
      {message && (
        <p
          className={message.ok ? "owner-block-ok" : "owner-block-error"}
          role="status"
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
