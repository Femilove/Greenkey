"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewActions({
  id,
  status,
}: {
  id: string;
  status: "pending" | "rejected" | "approved";
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");

  async function setStatus(next: "approved" | "rejected") {
    setPending(next === "approved" ? "approve" : "reject");
    setError("");
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Could not update this listing.");
        return;
      }
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  async function remove() {
    if (!confirm("Permanently delete this listing? This cannot be undone."))
      return;
    setPending("reject");
    setError("");
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Could not delete this listing.");
        return;
      }
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="review-actions">
      <div className="review-actions-buttons">
        {status !== "approved" && (
          <button
            type="button"
            className="review-approve"
            disabled={!!pending}
            onClick={() => setStatus("approved")}
          >
            {pending === "approve" ? "Approving…" : "Approve"}
          </button>
        )}
        {status === "approved" && (
          <button
            type="button"
            className="review-reject"
            disabled={!!pending}
            onClick={() =>
              confirm(
                "Remove this listing from the site? Existing bookings are kept, and you can approve it again later.",
              ) && setStatus("rejected")
            }
          >
            {pending === "reject" ? "Removing…" : "Remove from site"}
          </button>
        )}
        {status === "rejected" && (
          <button
            type="button"
            className="review-reject"
            disabled={!!pending}
            aria-label="Delete listing permanently"
            onClick={remove}
          >
            🗑 Delete
          </button>
        )}
        {status === "pending" && (
          <button
            type="button"
            className="review-reject"
            disabled={!!pending}
            onClick={() => setStatus("rejected")}
          >
            {pending === "reject" ? "Rejecting…" : "Reject"}
          </button>
        )}
      </div>
      {error && <p className="review-actions-error">{error}</p>}
    </div>
  );
}
