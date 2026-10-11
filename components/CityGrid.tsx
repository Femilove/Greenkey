import Image from "next/image";
import Link from "next/link";
import { citySlug, type City } from "@/types/property";

const CITY_IMAGES: Record<City, string> = {
  Abuja: "/Abuja.jpg",
  Ibadan: "/ibadan.jpg",
  Enugu: "/enugu.jpg",
  Lagos: "/Lagos.jpg",
  "Port Harcourt": "/PH.jpg",
  Benin: "/city-sunset.jpg",
};

export default function CityGrid() {
  return (
    <section
      className="apartment-explorer"
      aria-labelledby="apartment-explorer-heading"
    >
      <h2 id="apartment-explorer-heading">Explore Homes &amp; Apartments</h2>
      <div className="city-grid">
        {(Object.keys(CITY_IMAGES) as City[]).map((city) => (
          <Link
            key={city}
            className="city-card"
            href={`/homes?location=${citySlug(city)}`}
          >
            <Image
              src={CITY_IMAGES[city]}
              alt={city}
              fill
              sizes="(max-width: 560px) 100vw, 360px"
            />
            <span>{city}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
