"use client";

import Image from "next/image";
import Link from "next/link";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import { discountedPrice, formatNaira } from "@/types/property";

export default function SavedPage() {
  const { saved, ready, remove } = useSavedProperties();

  return (
    <div className="saved-page">
      <Link className="back-link" href="/">
        &larr; Back to homes
      </Link>
      <h1>Saved homes</h1>
      {ready && saved.length === 0 && <p>You have not saved any homes yet.</p>}
      <div className="saved-properties" aria-live="polite">
        {saved.map((property) => (
          <article className="saved-property-card" key={property.id}>
            <button
              className="saved-love-button"
              type="button"
              aria-label={`Remove ${property.name} from saved homes`}
              onClick={() => remove(property.id)}
            >
              <span aria-hidden="true">♥</span>
            </button>
            <Link
              className="saved-property-link"
              href={`/listings/${property.id}`}
              aria-label={`View ${property.name}`}
            >
              <Image
                unoptimized={property.image.endsWith(".gif")}
                src={property.image}
                alt={property.imageAlt}
                width={400}
                height={190}
              />
              <div className="saved-property-details">
                <h4>{property.type}</h4>
                <h3>{property.name}</h3>
                <h4>Starting from</h4>
                <h3>{formatNaira(discountedPrice(property))}</h3>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
