"use client";

import Image from "next/image";
import Link from "next/link";
import { discountedPrice, formatNaira, type Property } from "@/types/property";

interface Props {
  property: Property;
  saved: boolean;
  onToggleSave: (property: Property) => void;
}

export default function PropertyCard({ property, saved, onToggleSave }: Props) {
  const { id, image, imageAlt, type, name, price, discount } = property;

  return (
    <article className="property-card">
      <Link
        className="property-card-link"
        href={`/listings/${id}`}
        aria-label={`View ${name}`}
      />
      <button
        className={`save-property${saved ? " is-saved" : ""}`}
        type="button"
        aria-label={`${saved ? "Unsave" : "Save"} ${name}`}
        aria-pressed={saved}
        onClick={() => onToggleSave(property)}
      >
        <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
      </button>
      <Image
        src={image}
        alt={imageAlt}
        width={400}
        height={230}
        sizes="(max-width: 560px) 100vw, 33vw"
      />
      <div className="property-details">
        <h4>{type}</h4>
        <h3>{name}</h3>
        <h4>Starting from</h4>
        <h3>
          {formatNaira(discountedPrice(property))}
          {discount ? (
            <s
              style={{
                marginLeft: 8,
                fontSize: "0.85rem",
                fontWeight: 400,
                color: "#94a3b8",
              }}
            >
              {formatNaira(price)}
            </s>
          ) : null}
        </h3>
      </div>
    </article>
  );
}
