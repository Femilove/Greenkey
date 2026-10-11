import NextAuth from "next-auth";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        await connectDB();
        const user = await User.findOne({ email });
        // No passwordHash means this account was created via Google/Apple; it has no password to check.
        if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return null;

        return { id: String(user._id), email: user.email, role: user.role };
      },
    }),
    // Only registered if the env vars are set, so the app still runs without them.
    ...(process.env.AUTH_GOOGLE_ID ? [Google] : []),
    ...(process.env.AUTH_APPLE_ID ? [Apple] : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Credentials users are already checked in `authorize`.
      if (account?.provider !== "google" && account?.provider !== "apple") return true;
      if (!user.email) return false;

      // Link/create a User document so OAuth accounts have the same role field as everyone else.
      await connectDB();
      const existing = await User.findOne({ email: user.email.toLowerCase() });
      if (!existing) {
        const created = await User.create({ email: user.email.toLowerCase(), role: "user", passwordHash: "" });
        user.id = String(created._id);
        user.role = created.role;
      } else {
        user.id = String(existing._id);
        user.role = existing.role;
      }
      return true;
    },
  },
});
