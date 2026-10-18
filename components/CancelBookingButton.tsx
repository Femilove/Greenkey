"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";

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
      <ConfirmDialog
        open={confirming}
        title="Cancel this booking?"
        message="Your dates will be released."
        confirmLabel="Yes, cancel"
        cancelLabel="Keep booking"
        onCancel={() => setConfirming(false)}
        onConfirm={cancel}
      />
      {error && (
        <p className="dashboard-delete-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
