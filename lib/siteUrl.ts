/** The public address of the site (no trailing slash). Set NEXT_PUBLIC_APP_URL in production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000").replace(/\/+$/, "");
