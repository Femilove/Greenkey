import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export default function LegalPage({
  title,
  children,
  showDate = true,
}: {
  title: string;
  children: React.ReactNode;
  showDate?: boolean;
}) {
  return (
    <article className="legal-page">
      <Link href="/" className="listing-back">
        ← Back to home
      </Link>
      <h1>{title}</h1>
      {showDate && (
        <p className="legal-updated">Last updated: {LEGAL.lastUpdated}</p>
      )}
      {children}
    </article>
  );
}
