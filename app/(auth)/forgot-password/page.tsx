"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setStatus("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus(data?.error ?? "Something went wrong. Try again.");
        return;
      }
      setSent(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="signin-card">
      <h2>Reset your password</h2>
      {sent ? (
        <p className="auth-form-intro">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a
          link to reset your password. It&apos;s valid for 1 hour.
        </p>
      ) : (
        <>
          <p className="auth-form-intro">
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </p>
          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
            </button>
            {status && (
              <p className="form-status" role="status">
                {status}
              </p>
            )}
          </form>
        </>
      )}
      <Link className="sign-in-button" href="/login">
        Back to sign in
      </Link>
    </div>
  );
}
