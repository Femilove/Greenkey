"use client";

import Image from "next/image";
import { useState } from "react";

/** The listing's photos with previous/next arrows. The first photo is shown first. */
export default function PhotoGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const src = images[index] ?? images[0];
  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  return (
    <div className="photo-gallery">
      <Image
        key={src}
        unoptimized={src.endsWith(".gif")}
        src={src}
        alt={alt}
        width={900}
        height={480}
        priority={index === 0}
        className="photo-gallery-image"
      />
      {count > 1 && (
        <>
          <button
            type="button"
            className="photo-gallery-arrow photo-gallery-prev"
            aria-label="Previous photo"
            onClick={() => go(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="photo-gallery-arrow photo-gallery-next"
            aria-label="Next photo"
            onClick={() => go(1)}
          >
            ›
          </button>
          <span className="photo-gallery-count" aria-live="polite">
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>
  );
}
