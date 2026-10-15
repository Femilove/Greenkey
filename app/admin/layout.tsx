import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/");

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <p className="dashboard-brand">Admin</p>
        <nav aria-label="Admin navigation">
          <Link href="/admin">Pending listings</Link>
          <Link href="/admin?status=approved">Live listings</Link>
          <Link href="/admin?status=rejected">Rejected listings</Link>
        </nav>
        <Link className="dashboard-exit" href="/">
          &larr; Back to Air
        </Link>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
