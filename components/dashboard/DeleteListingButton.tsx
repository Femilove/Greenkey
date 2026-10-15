"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteListingButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setConfirming(false);
    setPending(true);
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
      setPending(false);
    }
  }

  return (
    <div className="dashboard-delete">
      {!confirming && (
        <button
          type="button"
          className="dashboard-delete-button"
          disabled={pending}
          onClick={() => setConfirming(true)}
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
      )}
      {confirming && (
        <div className="review-confirm" role="alertdialog">
          <p>Delete &ldquo;{name}&rdquo;? This can&apos;t be undone.</p>
          <div className="review-actions-buttons">
            <button
              type="button"
              className="review-reject"
              onClick={handleDelete}
            >
              Yes, delete
            </button>
            <button
              type="button"
              className="review-cancel"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && <p className="dashboard-delete-error">{error}</p>}
    </div>
  );
}
