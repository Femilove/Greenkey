import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no database or bcrypt here) so middleware can use it.
const GUEST_ONLY = ["/login", "/register"]; // logged-in users get sent home
const PUBLIC = [...GUEST_ONLY, "/rentage/login", "/rentage/register", "/forgot-password", "/reset-password", "/terms", "/privacy", "/about", "/how-we-work", "/content-guidelines", "/contact", "/partner-dispute"];

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      if (GUEST_ONLY.includes(path) && loggedIn) return Response.redirect(new URL("/", nextUrl));
      if (path === "/" || PUBLIC.includes(path)) return true; // "/" is the landing page when logged out
      return loggedIn; // false => redirected to /login?callbackUrl=...
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // Lets the client refresh just the role in the JWT after an account action
      // (e.g. "become a listing owner") without a full sign-out/sign-in.
      if (trigger === "update" && session?.user?.role) {
        token.role = session.user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
