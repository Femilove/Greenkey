import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata = {
  title: `Contact customer service | ${LEGAL.siteName}`,
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact customer service" showDate={false}>
      <p>
        We&apos;re here to help with bookings, payments, your account and
        listings.
      </p>

      <h2>Email us</h2>
      <p>
        <strong>{LEGAL.contactEmail}</strong>
      </p>
      <p>
        To help us reply faster, include the email you signed up with. If your
        question is about a booking, also include the name of the home and your
        dates.
      </p>

      <h2>Before you write</h2>
      <ul>
        <li>
          See your reservations under <Link href="/bookings">Bookings</Link>.
        </li>
        <li>
          Read <Link href="/how-we-work">How we work</Link> for how booking and
          payment work.
        </li>
        <li>
          Please note that all payments are final (see our{" "}
          <Link href="/terms">Terms of Service</Link>).
        </li>
        <li>
          Hosts with a disagreement can use{" "}
          <Link href="/partner-dispute">Partner dispute</Link>.
        </li>
      </ul>

      <h2>The team</h2>
      <p>
        {LEGAL.siteName} is run by {LEGAL.team.join(" and ")}.
      </p>
    </LegalPage>
  );
}
