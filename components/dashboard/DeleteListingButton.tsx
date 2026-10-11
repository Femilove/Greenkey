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
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
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
      <button
        type="button"
        className="dashboard-delete-button"
        disabled={pending}
        onClick={handleDelete}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error && <p className="dashboard-delete-error">{error}</p>}
    </div>
  );
}
