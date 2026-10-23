import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata = {
  title: `Partner dispute | ${LEGAL.siteName}`,
  description:
    "How property owners and partners can raise and resolve a dispute with Avenir.",
  alternates: { canonical: "/partner-dispute" },
};

export default function PartnerDisputePage() {
  return (
    <LegalPage title="Partner dispute" showDate={false}>
      <p>
        If you&apos;re a host (partner) and you disagree with a decision or a
        payment, we want to put it right. This applies to rejected listings,
        payouts, commission, bookings or a guest&apos;s conduct.
      </p>

      <h2>How to raise a dispute</h2>
      <ol>
        <li>
          Email <strong>{LEGAL.contactEmail}</strong> with the subject
          &quot;Partner dispute&quot;.
        </li>
        <li>
          Include your account email, the listing name, the booking date or
          payment reference if there is one, and what you&apos;d like us to do.
        </li>
        <li>Add any photos or messages that support your case.</li>
      </ol>

      <h2>What happens next</h2>
      <p>
        Your dispute is reviewed by the {LEGAL.siteName} team,{" "}
        {LEGAL.team.join(" and ")}. We&apos;ll reply by email, may ask for more
        details, and will tell you the outcome and the reason for it.
      </p>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/terms">Terms of Service</Link>
        </li>
        <li>
          <Link href="/content-guidelines">Content guidelines</Link>
        </li>
        <li>
          <Link href="/contact">Contact customer service</Link>
        </li>
      </ul>
    </LegalPage>
  );
}
