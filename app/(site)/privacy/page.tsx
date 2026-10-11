import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: `Privacy Notice | ${LEGAL.siteName}` };

export default function PrivacyPage() {
  const { siteName, companyName, contactEmail } = LEGAL;
  return (
    <LegalPage title="Privacy Notice">
      <p>
        {companyName} (&quot;we&quot;) runs {siteName}. This notice explains
        what personal data we collect, why, and the choices you have.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your email address and a securely
          hashed password (we never store your password in readable form). If
          you sign in with Google or Apple, we receive your email address from
          them.
        </li>
        <li>
          <strong>Bookings:</strong> the home, dates, number of guests, amount
          paid and payment reference.
        </li>
        <li>
          <strong>Hosts:</strong> listing details and photos, and bank account
          details used to set up payouts.
        </li>
        <li>
          <strong>Technical data:</strong> a session cookie that keeps you
          signed in, and basic server logs.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To create and secure your account and let you sign in.</li>
        <li>To process bookings and payments, and pay hosts.</li>
        <li>
          To send essential emails, such as password resets and booking
          receipts.
        </li>
        <li>To review listings, prevent fraud and keep the site running.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We only share data with service providers that help us run the site, and
        only as needed:
      </p>
      <ul>
        <li>
          <strong>Paystack</strong> for payments and host payouts (they handle
          card and bank details).
        </li>
        <li>
          <strong>Cloudinary</strong> for storing listing photos.
        </li>
        <li>
          <strong>Resend</strong> for sending emails.
        </li>
        <li>
          <strong>Google / Apple</strong> if you choose to sign in with them.
        </li>
        <li>Our database and hosting providers.</li>
      </ul>
      <p>
        When you book, the host can see the details needed to host your stay. We
        do not sell your personal data. We may disclose data if required by law.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your data while your account is active and as long as needed for
        payments, accounting and legal obligations. You can ask us to delete
        your account, subject to those obligations.
      </p>

      <h2>Your rights</h2>
      <p>
        Under Nigerian data protection law you can ask to access, correct or
        delete your personal data, object to certain uses, and complain to the
        Nigeria Data Protection Commission. To make a request, email{" "}
        <strong>{contactEmail}</strong>.
      </p>

      <h2>Cookies</h2>
      <p>
        We use only the cookies needed to keep you signed in and secure. We
        don&apos;t use advertising cookies.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this notice; the date above shows the latest version. See
        also our <Link href="/terms">Terms of Service</Link>.
      </p>
    </LegalPage>
  );
}
