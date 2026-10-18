"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";

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
      <button
        type="button"
        className="dashboard-delete-button"
        disabled={pending}
        onClick={() => setConfirming(true)}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      <ConfirmDialog
        open={confirming}
        title="Delete this listing?"
        message={`"${name}" will be permanently deleted. This can't be undone.`}
        confirmLabel="Yes, delete"
        onCancel={() => setConfirming(false)}
        onConfirm={handleDelete}
      />
      {error && <p className="dashboard-delete-error">{error}</p>}
    </div>
  );
}
