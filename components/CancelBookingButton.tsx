"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CancelBookingButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function cancel() {
    if (!confirm("Cancel this booking?")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else
        alert(
          (await res.json().catch(() => null))?.error ??
            "Could not cancel this booking.",
        );
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className="booking-cancel"
      disabled={pending}
      onClick={cancel}
    >
      {pending ? "Cancelling…" : "Cancel"}
    </button>
  );
}
