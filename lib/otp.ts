import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const OTP_TTL_MS = 10 * 60 * 1000; // a code is valid for 10 minutes
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // at most one new code a minute
export const OTP_MAX_ATTEMPTS = 5; // wrong guesses allowed per code

/** A random 6-digit code, e.g. "042917". */
export const generateOtp = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

/** Codes are stored hashed (keyed with AUTH_SECRET), never in plain text. */
export function hashOtp(email: string, code: string) {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "dev-secret").update(`${email}:${code}`).digest("hex");
}

export function otpMatches(email: string, code: string, storedHash: string) {
  const a = Buffer.from(hashOtp(email, code));
  const b = Buffer.from(storedHash);
  return a.length === b.length && timingSafeEqual(a, b);
}
