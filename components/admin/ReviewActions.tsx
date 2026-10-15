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
  const [confirming, setConfirming] = useState<"remove" | "delete" | null>(
    null,
  );

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
    setConfirming(null);
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
            onClick={() => setConfirming("remove")}
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
            onClick={() => setConfirming("delete")}
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
      {confirming && (
        <div
          className="review-confirm"
          role="alertdialog"
          aria-live="assertive"
        >
          <p>
            {confirming === "remove"
              ? "Remove this listing from the site? Existing bookings are kept, and you can approve it again later."
              : "Permanently delete this listing? This cannot be undone."}
          </p>
          <div className="review-actions-buttons">
            <button
              type="button"
              className="review-reject"
              disabled={!!pending}
              onClick={() => {
                if (confirming === "remove") {
                  setConfirming(null);
                  setStatus("rejected");
                } else remove();
              }}
            >
              {confirming === "remove" ? "Yes, remove" : "Yes, delete"}
            </button>
            <button
              type="button"
              className="review-cancel"
              onClick={() => setConfirming(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && <p className="review-actions-error">{error}</p>}
    </div>
  );
}
