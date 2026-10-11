"use client";

import PropertyCard from "@/components/PropertyCard";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import type { Property } from "@/types/property";

export default function PropertyGrid({
  properties,
}: {
  properties: Property[];
}) {
  const { isSaved, toggle } = useSavedProperties();

  return (
    <div className="homes-grid">
      {properties.map((p) => (
        <PropertyCard
          key={p.id}
          property={p}
          saved={isSaved(p.id)}
          onToggleSave={toggle}
        />
      ))}
    </div>
  );
}
