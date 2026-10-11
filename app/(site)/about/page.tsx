import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: `About ${LEGAL.siteName}` };

export default function AboutPage() {
  return (
    <LegalPage title={`About ${LEGAL.siteName}`} showDate={false}>
      <p>
        {LEGAL.siteName} helps people find and book comfortable places to stay
        across Nigeria, and helps property owners reach guests and get paid
        securely.
      </p>

      <h2>What we do</h2>
      <p>
        Guests can browse homes in cities including Lagos, Abuja, Ibadan, Enugu,
        Port Harcourt and Benin, check which dates are free, and book and pay
        online. Hosts list their properties, set their own prices and receive
        their earnings straight to their bank account.
      </p>

      <h2>What we care about</h2>
      <ul>
        <li>
          <strong>Trust.</strong> Every listing is reviewed before it goes live.
        </li>
        <li>
          <strong>Clarity.</strong> Prices, dates and policies are shown up
          front, including that payments are final.
        </li>
        <li>
          <strong>Fair payouts.</strong> Payments go through Paystack and hosts
          are paid directly, with a clear service commission.
        </li>
      </ul>

      <h2>Get in touch</h2>
      <p>
        Questions or feedback? Email <strong>{LEGAL.contactEmail}</strong>. Want
        to list your place?{" "}
        <Link href="/rentage/register">Create a host account</Link>.
      </p>
    </LegalPage>
  );
}
