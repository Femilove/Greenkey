/**
 * Public base URL used when building links that leave the app (payment return
 * link, password-reset email). Behind a proxy, `req.url` can show an internal
 * host like localhost:3000, so prefer the configured public URL.
 */
export function appUrl(req: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL;
  return (configured || new URL(req.url).origin).replace(/\/+$/, "");
}
