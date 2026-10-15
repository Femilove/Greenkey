import Image from "next/image";
import Link from "next/link";
import BookingPanel from "@/components/BookingPanel";
import CityGrid from "@/components/CityGrid";
import PropertyCarousel from "@/components/PropertyCarousel";
import Recommendations from "@/components/Recommendations";
import StayCarousel from "@/components/StayCarousel";
import WhyChooseUs from "@/components/WhyChooseUs";
import { auth } from "@/auth";
import { getApprovedListings } from "@/lib/listings";

const HERO_IMAGES = [
  "/caro4.jpg",
  "/caro1.jpg",
  "/caro3.jpg",
  "/apartment.jpg",
];
const CATEGORIES = [
  { label: "Hotel", image: "/hotel.jpg", href: "/homes?type=hotel" },
  {
    label: "Apartment",
    image: "/apartment.jpg",
    href: "/homes?type=apartment",
  },
];

export default async function HomePage() {
  const session = await auth();
  const properties = await getApprovedListings(10);

  return (
    <>
      <section id="all" aria-labelledby="all-heading">
        <div className="hero-copy">
          <h1 id="all-heading">
            Find the perfect place.
            <br />
            Stress-Free
          </h1>
          {!session && (
            <>
              <p className="landing-sub">
                Browse homes freely. Create an account or sign in when
                you&apos;re ready to book.
              </p>
              <div className="landing-cta">
                <Link className="landing-primary" href="/register">
                  Create an account
                </Link>
                <Link className="landing-secondary" href="/login">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="image-cluster" aria-label="Featured homes">
          {HERO_IMAGES.map((src) => (
            <Image
              key={src}
              className="home-image"
              src={src}
              alt="Featured rental home"
              width={216}
              height={216}
              style={{ height: "auto" }}
              priority
            />
          ))}
        </div>
      </section>

      <BookingPanel />

      <section
        className="browse-categories"
        aria-labelledby="browse-categories-heading"
      >
        <h3 id="browse-categories-heading">Browse by category</h3>
        <div className="category-grid">
          {CATEGORIES.map(({ label, image, href }) => (
            <div className="category-item" key={label}>
              <Link className="category-card" href={href}>
                <Image
                  src={image}
                  alt={label}
                  width={340}
                  height={180}
                  style={{ width: "100%" }}
                />
              </Link>
              <Link className="category-label" href={href}>
                {label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <PropertyCarousel properties={properties} />

      <section id="services" aria-label="Services" />

      <CityGrid />
      <WhyChooseUs />
      <StayCarousel />
      <Recommendations />
    </>
  );
}
