import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

// Run on every page except auth APIs, Next internals and public images.
export const config = {
  matcher: ["/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|svg|webp|gif|ico)$).*)"],
};
