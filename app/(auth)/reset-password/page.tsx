"use client";

import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setStatus("Passwords don't match.");
    setPending(true);
    setStatus("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus(data?.error ?? "Something went wrong. Try again.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return (
      <div className="signin-card">
        <h2>Invalid link</h2>
        <p className="auth-form-intro">
          This reset link is missing its token. Request a new one.
        </p>
        <Link className="sign-in-button" href="/forgot-password">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="signin-card">
      <h2>Set a new password</h2>
      {done ? (
        <p className="auth-form-intro">
          Your password has been reset. Taking you to sign in…
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            New password
            <PasswordInput
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label>
            Confirm new password
            <PasswordInput
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          <button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Reset password"}
          </button>
          {status && (
            <p className="form-status" role="status">
              {status}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="signin-card">
          <h2>Loading…</h2>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
