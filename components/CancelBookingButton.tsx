"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CancelBookingButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    setConfirming(false);
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else
        setError(
          (await res.json().catch(() => null))?.error ??
            "Could not cancel this booking.",
        );
    } finally {
      setPending(false);
    }
  }

  if (confirming) {
    return (
      <div className="review-confirm" role="alertdialog">
        <p>Cancel this booking?</p>
        <div className="review-actions-buttons">
          <button type="button" className="review-reject" onClick={cancel}>
            Yes, cancel
          </button>
          <button
            type="button"
            className="review-cancel"
            onClick={() => setConfirming(false)}
          >
            Keep booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className="booking-cancel"
        disabled={pending}
        onClick={() => setConfirming(true)}
      >
        {pending ? "Cancelling…" : "Cancel"}
      </button>
      {error && (
        <p className="dashboard-delete-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
