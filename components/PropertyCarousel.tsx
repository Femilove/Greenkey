"use client";

import { useEffect, useRef, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import type { Property } from "@/types/property";

export default function PropertyCarousel({
  properties,
}: {
  properties: Property[];
}) {
  const { isSaved, toggle } = useSavedProperties();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [step, setStep] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      const card = track?.firstElementChild as HTMLElement | null;
      if (!track || !viewport || !card) return;
      const visible = window.matchMedia("(max-width: 560px)").matches ? 1 : 3;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      setStep((card.offsetWidth + gap) * visible);
      setMaxOffset(Math.max(0, track.scrollWidth - viewport.clientWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [properties.length]);

  const maxPosition = step ? Math.ceil(maxOffset / step) : 0;
  const current = Math.min(position, maxPosition);
  const offset = Math.min(current * step, maxOffset);

  return (
    <section
      className="property-carousel"
      aria-labelledby="property-carousel-heading"
    >
      <h2 id="property-carousel-heading">Available homes</h2>
      <div className="property-carousel-shell">
        <button
          className="carousel-arrow carousel-arrow-left"
          type="button"
          aria-label="Show previous homes"
          disabled={current === 0}
          onClick={() => setPosition(Math.max(0, current - 1))}
        >
          &#8592;
        </button>
        <div className="property-carousel-viewport" ref={viewportRef}>
          <div
            className="property-carousel-track"
            ref={trackRef}
            style={{ transform: `translateX(${-offset}px)` }}
          >
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                saved={isSaved(property.id)}
                onToggleSave={toggle}
              />
            ))}
          </div>
        </div>
        <button
          className="carousel-arrow carousel-arrow-right"
          type="button"
          aria-label="Show next homes"
          disabled={current >= maxPosition}
          onClick={() => setPosition(Math.min(maxPosition, current + 1))}
        >
          &#8594;
        </button>
      </div>
    </section>
  );
}
