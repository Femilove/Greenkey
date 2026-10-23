const RESEND_URL = "https://api.resend.com/emails";

/**
 * Sends an email via Resend. If RESEND_API_KEY isn't set yet, this logs the
 * email to the console instead of throwing — so password reset works end to
 * end in local dev before you've signed up for an email provider. Swap in
 * any other provider later by changing just this one function.
 */
export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  // Hosts like Vercel keep quote marks typed around a value, which Resend rejects as an invalid sender.
  const from = (process.env.EMAIL_FROM ?? "").trim().replace(/^["']+|["']+$/g, "").trim() || "Air <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY not set — would have sent "${input.subject}" to ${input.to}:\n${input.html}`);
    return;
  }

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: input.to, subject: input.subject, html: input.html }),
  });
  if (!res.ok) {
    console.error("Resend email failed:", await res.text().catch(() => res.statusText));
    throw new Error("Could not send email.");
  }
}

export function passwordResetEmailHtml(resetUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #315f39;">Reset your Air password</h2>
      <p>We received a request to reset your password. This link is valid for 1 hour.</p>
      <p style="margin: 28px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 22px; color: #fff; background: #7a9b76; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Reset password
        </a>
      </p>
      <p style="color: #64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
    </div>
  `;
}

export function signupOtpEmailHtml(code: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #315f39;">Confirm your email</h2>
      <p>Use this code to finish creating your Avenir account. It is valid for 10 minutes.</p>
      <p style="margin: 28px 0; font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #18222d;">${code}</p>
      <p style="color: #64748b; font-size: 13px;">If you didn't try to sign up, you can safely ignore this email. Never share this code with anyone.</p>
    </div>
  `;
}
