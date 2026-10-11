"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BecomeOwnerButton({ email }: { email: string }) {
  const router = useRouter();
  const { update } = useSession();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/account/become-owner", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Could not switch your account.");
        return;
      }
      await update({ user: { role: data.role } }); // refreshes the role in the session's JWT
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="become-owner-card">
      <p className="eyebrow">WELCOME BACK</p>
      <h2>Become a listing account</h2>
      <p className="become-owner-intro">
        You&apos;re signed in as <strong>{email}</strong>. Switch this account
        to a listing account to add and manage rentals.
      </p>
      <button type="button" disabled={pending} onClick={handleClick}>
        {pending ? "Switching…" : "Switch to a listing account"}
      </button>
      {error && (
        <p className="become-owner-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
