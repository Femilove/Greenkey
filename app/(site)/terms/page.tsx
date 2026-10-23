import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata = {
  title: `Terms of Service | ${LEGAL.siteName}`,
  description:
    "The terms that apply when you browse, book or list a home on Avenir, including bookings, payments and cancellations.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const { siteName, companyName, contactEmail, country } = LEGAL;
  return (
    <LegalPage title="Terms of Service">
      <p>
        These terms govern your use of {siteName}, operated by {companyName}{" "}
        (&quot;we&quot;, &quot;us&quot;). By creating an account, listing a
        property or making a booking you agree to them. If you don&apos;t agree,
        please don&apos;t use the site.
      </p>

      <h2>1. What {siteName} is</h2>
      <p>
        {siteName} is a platform that connects guests with property owners
        (&quot;hosts&quot;) offering short-term stays. We are not the owner of
        the properties listed, and the stay itself is an arrangement between the
        guest and the host.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>
          You must provide accurate information and keep your password secure.
          You are responsible for activity on your account.
        </li>
        <li>
          You must be at least 18 years old to create an account or make a
          booking.
        </li>
        <li>
          We may suspend or close accounts that break these terms or are used
          for fraud or abuse.
        </li>
      </ul>

      <h2>3. Bookings and payments</h2>
      <ul>
        <li>
          Prices are shown in Nigerian naira (NGN). A booking is confirmed only
          after payment succeeds.
        </li>
        <li>
          Payments are processed by Paystack. We do not store your card details.
        </li>
        <li>
          Until payment is completed, the selected dates are held for a short
          time (about 30 minutes) and then released.
        </li>
        <li>
          <strong>No refunds.</strong> All payments are final once made, and
          paid bookings cannot be cancelled on the site. Nothing in this section
          limits any right you have under applicable law.
        </li>
        <li>
          We charge a service commission on each booking. It is deducted
          automatically and the remainder is paid to the host.
        </li>
      </ul>

      <h2>4. Hosts</h2>
      <ul>
        <li>
          Hosts must have the right to list the property and must give accurate
          descriptions, photos, prices and availability.
        </li>
        <li>
          New and edited listings are reviewed by us before they appear, and we
          may reject or remove any listing.
        </li>
        <li>
          Hosts must honour confirmed bookings and are responsible for their
          property, its safety, and any taxes or licences that apply.
        </li>
        <li>
          Hosts must provide valid bank details so that payouts can be made
          through Paystack.
        </li>
      </ul>

      <h2>5. Acceptable use</h2>
      <p>
        Don&apos;t post false, misleading or unlawful content, upload photos you
        don&apos;t have the right to use, attempt to access other people&apos;s
        accounts, interfere with the site, or use it to commit fraud.
      </p>

      <h2>6. Our responsibility</h2>
      <p>
        We provide the platform &quot;as is&quot;. To the extent the law allows,
        we are not liable for the condition or safety of any property, the
        conduct of any guest or host, or indirect losses. Nothing in these terms
        excludes liability that cannot be excluded by law.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update these terms from time to time. The date above shows the
        latest version; continued use means you accept the changes.
      </p>

      <h2>8. Governing law and contact</h2>
      <p>
        These terms are governed by the laws of {country}. Questions? Email{" "}
        <strong>{contactEmail}</strong>. See also our{" "}
        <Link href="/privacy">Privacy Notice</Link>.
      </p>
    </LegalPage>
  );
}
