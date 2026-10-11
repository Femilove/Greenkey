"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  "/caro1.jpg",
  "/caro2.jpg",
  "/caro3.jpg",
  "/caro4.jpg",
  "/caro5.jpg",
];

export default function StayCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % SLIDES.length),
      4000,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="stay-carousel" aria-labelledby="stay-carousel-heading">
      <div className="carousel-slides" aria-hidden="true">
        {SLIDES.map((src, i) => (
          <Image
            key={src}
            className={`carousel-slide${i === active ? " is-active" : ""}`}
            src={src}
            alt=""
            fill
            sizes="1120px"
            priority={i === 0}
          />
        ))}
      </div>
      <div className="stay-carousel-content">
        <h2 id="stay-carousel-heading">
          Your perfect stay is just a click away
        </h2>
        <h3>Search, book and move in — it’s that easy</h3>
        <Link className="browse-apartments-button" href="/homes">
          Browse Apartments
        </Link>
      </div>
    </section>
  );
}
