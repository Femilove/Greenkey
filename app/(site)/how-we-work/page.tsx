import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata = {
  title: `How we work | ${LEGAL.siteName}`,
  description:
    "See how Avenir works: guests browse and book verified homes, owners list properties for review, and payments are handled securely.",
  alternates: { canonical: "/how-we-work" },
};

export default function HowWeWorkPage() {
  return (
    <LegalPage title="How we work" showDate={false}>
      <h2>For guests</h2>
      <ol>
        <li>Search for a home by city, number of guests and dates.</li>
        <li>
          Open a listing to see its photos, price and details, then pick your
          check-in and check-out dates. If a date is taken, we show you which
          dates are booked.
        </li>
        <li>
          Pay securely through Paystack. Your booking is confirmed once the
          payment succeeds.
        </li>
        <li>
          You&apos;ll find your booking under{" "}
          <Link href="/bookings">Bookings</Link>.
        </li>
      </ol>
      <p>
        Please note that all payments are final: paid bookings can&apos;t be
        cancelled or refunded on the site. Read our{" "}
        <Link href="/terms">Terms of Service</Link> for the details.
      </p>

      <h2>For hosts</h2>
      <ol>
        <li>Create a host account and add your payout bank details.</li>
        <li>
          Add your listing with photos, price, location and guest capacity. The
          first photo you upload is the cover guests see first.
        </li>
        <li>
          We review each new or edited listing before it appears on the site.
        </li>
        <li>
          When a guest books, the payment is split automatically: our service
          commission is kept and the rest goes to your bank account.
        </li>
      </ol>

      <h2>How dates are held</h2>
      <p>
        When a guest starts paying, those dates are held for about 30 minutes so
        nobody else can book them at the same time. If the payment isn&apos;t
        completed, the dates are released. The day one stay ends, the next guest
        can check in.
      </p>

      <h2>Need help?</h2>
      <p>
        Email <strong>{LEGAL.contactEmail}</strong>.
      </p>
    </LegalPage>
  );
}
