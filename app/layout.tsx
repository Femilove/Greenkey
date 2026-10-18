import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Avenir | Rent apartments and homes in Nigeria",
  description:
    "Find and book apartments, hotels and homes to rent across Nigeria. Browse verified listings and book your stay stress-free with Avenir.",
  applicationName: "Avenir",
  openGraph: {
    type: "website",
    siteName: "Avenir",
    title: "Avenir | Rent apartments and homes in Nigeria",
    description:
      "Find and book apartments, hotels and homes to rent across Nigeria.",
    images: ["/logo.svg"],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
