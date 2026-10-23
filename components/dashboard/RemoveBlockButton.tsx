"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function RemoveBlockButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setConfirming(false);
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/blocks/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else
        setError(
          (await res.json().catch(() => null))?.error ??
            "Could not remove this block.",
        );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="owner-block-remove"
        disabled={pending}
        onClick={() => setConfirming(true)}
      >
        {pending ? "Removing…" : "Unblock"}
      </button>
      <ConfirmDialog
        open={confirming}
        title="Unblock these dates?"
        message="Guests will be able to book them again."
        confirmLabel="Yes, unblock"
        cancelLabel="Keep blocked"
        onCancel={() => setConfirming(false)}
        onConfirm={remove}
      />
      {error && (
        <p className="owner-block-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
