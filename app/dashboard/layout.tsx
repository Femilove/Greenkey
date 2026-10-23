import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // Middleware only checks you're signed in; this checks you're a listing-account owner.
  if (session?.user?.role !== "owner") redirect("/");

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <p className="dashboard-brand">Your listings</p>
        <nav aria-label="Dashboard navigation">
          <Link href="/dashboard">My listings</Link>
          <Link href="/dashboard/bookings">Bookings</Link>
          <Link href="/dashboard/listings/new">Add a listing</Link>
          <Link href="/dashboard/payout">Payout details</Link>
        </nav>
        <Link className="dashboard-exit" href="/">
          &larr; Back to Avenir
        </Link>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
