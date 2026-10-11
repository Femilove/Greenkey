import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { auth } from "@/auth";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <>
      <Navbar isLoggedIn={!!session} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
