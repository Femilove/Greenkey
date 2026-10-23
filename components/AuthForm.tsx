"use client";

import Link from "next/link";
import PasswordInput from "./PasswordInput";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";

export type AuthMode =
  | "login"
  | "register"
  | "listing-login"
  | "listing-register";

const COPY: Record<
  AuthMode,
  {
    title: string;
    intro: string;
    submit: string;
    alt?: { text: string; href: string };
  }
> = {
  login: {
    title: "Sign into your account",
    intro: "Enter your details to continue finding your perfect place.",
    submit: "Sign in",
    alt: { text: "Create an account", href: "/register" },
  },
  register: {
    title: "Create an account",
    intro: "Enter your details to continue finding your perfect place.",
    submit: "Register",
    alt: { text: "I already have an account", href: "/login" },
  },
  "listing-login": {
    title: "Sign in",
    intro: "Sign into your listing account",
    submit: "Continue",
    alt: { text: "Create a listing account", href: "/rentage/register" },
  },
  "listing-register": {
    title: "Create a listing account",
    intro: "Create an account to list your property",
    submit: "Continue",
    alt: { text: "Sign in", href: "/rentage/login" },
  },
};

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const { title, intro, submit, alt } = COPY[mode];
  const isRegister = mode === "register" || mode === "listing-register";
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  // Set once the sign-up details are accepted and a code has been emailed.
  const [verifying, setVerifying] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function finishSignIn() {
    const cb =
      new URLSearchParams(window.location.search).get("callbackUrl") ??
      (mode.startsWith("listing") ? "/dashboard" : "/");
    router.push(cb.startsWith("/") && !cb.startsWith("//") ? cb : "/");
    router.refresh();
  }

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!verifying) return;
    const code = String(new FormData(e.currentTarget).get("code") ?? "").trim();
    setPending(true);
    setStatus("");
    try {
      const res = await fetch("/api/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifying.email, code }),
      });
      if (!res.ok) {
        setStatus(
          (await res.json().catch(() => null))?.error ??
            "Could not verify that code.",
        );
        return;
      }
      const result = await signIn("credentials", {
        email: verifying.email,
        password: verifying.password,
        redirect: false,
      });
      if (result?.error) {
        setStatus("Your account is ready, but sign-in failed. Try signing in.");
        return;
      }
      finishSignIn();
    } finally {
      setPending(false);
    }
  }

  async function handleResend() {
    if (!verifying || cooldown > 0) return;
    setPending(true);
    setStatus("");
    try {
      const res = await fetch("/api/register/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifying.email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus(data?.error ?? "Could not send a new code.");
        return;
      }
      setCooldown(60);
      setStatus("A new code is on its way. Check your inbox and spam folder.");
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    setPending(true);
    setStatus("");
    try {
      if (isRegister) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            role: mode.startsWith("listing") ? "owner" : "user",
          }),
        });
        if (!res.ok) {
          setStatus(
            (await res.json().catch(() => null))?.error ??
              "Could not create your account.",
          );
          return;
        }
        // Account isn't created yet: ask for the code that was just emailed.
        setVerifying({ email: email.toLowerCase().trim(), password });
        setCooldown(60);
        setStatus("");
        return;
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setStatus(
          isRegister
            ? "Account created, but sign-in failed. Try signing in."
            : "Incorrect email or password.",
        );
        return;
      }
      finishSignIn();
    } finally {
      setPending(false);
    }
  }

  function handleOAuth(provider: "google") {
    setPending(true);
    const cb =
      new URLSearchParams(window.location.search).get("callbackUrl") ??
      (mode.startsWith("listing") ? "/dashboard" : "/");
    signIn(provider, {
      callbackUrl: cb.startsWith("/") && !cb.startsWith("//") ? cb : "/",
    });
  }

  if (verifying) {
    return (
      <form key="verify" className="signin-card" onSubmit={handleVerify}>
        <p className="eyebrow">ONE LAST STEP</p>
        <h2>Check your email</h2>
        <p className="intro">
          We sent a 6-digit code to <strong>{verifying.email}</strong>. Enter it
          below to finish creating your account.
        </p>

        <label htmlFor="code">Verification code</label>
        <input
          id="code"
          name="code"
          className="otp-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          placeholder="000000"
          required
          autoFocus
        />

        <button type="submit" disabled={pending}>
          {pending ? "Checking…" : "Verify and create account"}
        </button>

        <div className="auth-verify-actions">
          <button
            type="button"
            className="auth-link-button"
            disabled={pending || cooldown > 0}
            onClick={handleResend}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
          <button
            type="button"
            className="auth-link-button"
            onClick={() => {
              setVerifying(null);
              setStatus("");
              setCooldown(0);
            }}
          >
            Use a different email
          </button>
        </div>
        <p className="form-status" role="status">
          {status}
        </p>
      </form>
    );
  }

  return (
    <form key="register" className="signin-card" onSubmit={handleSubmit}>
      <p className="eyebrow">WELCOME</p>
      <h2>{title}</h2>
      <p className="intro">{intro}</p>

      <label htmlFor="email">Email address</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />

      <label htmlFor="password">Password</label>
      <PasswordInput
        id="password"
        name="password"
        autoComplete={isRegister ? "new-password" : "current-password"}
        required
      />
      {!isRegister && (
        <Link className="forgot-password-link" href="/forgot-password">
          Forgot your password?
        </Link>
      )}

      {isRegister && (
        <p className="auth-consent">
          By creating an account you agree to our{" "}
          <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/privacy">Privacy Notice</Link>.
        </p>
      )}
      <button type="submit" disabled={pending}>
        {submit}
      </button>
      {alt && (
        <Link className="sign-in-button" href={alt.href}>
          {alt.text}
        </Link>
      )}
      <p className="form-status" role="status">
        {status}
      </p>

      <div className="oauth-divider" role="separator">
        <span>or continue with</span>
      </div>
      <div className="oauth-buttons">
        <button
          type="button"
          className="oauth-button"
          disabled={pending}
          onClick={() => handleOAuth("google")}
        >
          <GoogleIcon /> Google
        </button>
      </div>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.73-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.27a12 12 0 0 0 0 10.73l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.6 4.6 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.1c.95-2.85 3.6-4.98 6.73-4.98Z"
      />
    </svg>
  );
}
