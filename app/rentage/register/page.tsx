import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AuthForm from "@/components/AuthForm";
import BecomeOwnerButton from "@/components/BecomeOwnerButton";

export const metadata = { title: "Add a rental | Greenkey" };

export default async function ListingRegisterPage() {
  const session = await auth();

  if (session?.user?.role === "owner") redirect("/dashboard"); // already a listing account
  if (session?.user?.role === "admin") redirect("/"); // admin accounts don't switch to listing accounts

  // Already signed in as a regular user: this is an upgrade, not a new account.
  if (session?.user)
    return <BecomeOwnerButton email={session.user.email ?? ""} />;

  return <AuthForm mode="listing-register" />;
}
