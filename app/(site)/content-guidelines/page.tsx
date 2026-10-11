import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: `Content guidelines | ${LEGAL.siteName}` };

export default function ContentGuidelinesPage() {
  return (
    <LegalPage title="Content guidelines" showDate={false}>
      <p>
        These guidelines apply to everything hosts post on {LEGAL.siteName}:
        listing names, descriptions, prices, addresses and photos. We review
        listings before they go live and may reject or remove any that
        don&apos;t follow them.
      </p>

      <h2>Be accurate</h2>
      <ul>
        <li>
          Describe the property honestly: type, location, number of bedrooms and
          how many guests it sleeps.
        </li>
        <li>
          Set a real nightly price in naira and only offer discounts you will
          honour.
        </li>
        <li>
          Keep your listing up to date. If anything changes, edit it (edits are
          reviewed again).
        </li>
      </ul>

      <h2>Photos</h2>
      <ul>
        <li>Upload only photos you took or have the right to use.</li>
        <li>
          Show the actual property. Don&apos;t use stock images, other
          people&apos;s listings or heavily edited pictures that misrepresent
          the place.
        </li>
        <li>
          Your first photo is the cover shown on the homes page, so make it your
          best one. You can add more for guests to browse.
        </li>
        <li>
          No people&apos;s faces without their permission, and no personal
          documents, plates or other private details.
        </li>
        <li>Photos must be JPG, PNG, WEBP or GIF, up to 4MB each.</li>
      </ul>

      <h2>Not allowed</h2>
      <ul>
        <li>False, misleading or duplicate listings.</li>
        <li>Offensive, discriminatory, sexual or illegal content.</li>
        <li>
          Contact details or links meant to move guests away from the
          site&apos;s payment process.
        </li>
        <li>
          Anything that breaks the law or our{" "}
          <Link href="/terms">Terms of Service</Link>.
        </li>
      </ul>

      <h2>Reporting a problem</h2>
      <p>
        If you see a listing that breaks these guidelines, email{" "}
        <strong>{LEGAL.contactEmail}</strong> with a link to it.
      </p>
    </LegalPage>
  );
}
