import Link from "next/link";
import { notFound } from "next/navigation";
import PhotoGallery from "@/components/PhotoGallery";
import BookingForm from "@/components/BookingForm";
import { auth } from "@/auth";
import { getListing } from "@/lib/listings";
import { discountedPrice, formatNaira } from "@/types/property";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const property = await getListing(id);
  if (!property) notFound();

  const { image, images, imageAlt, name, type, price, discount, location } =
    property;

  return (
    <article className="listing-page">
      <Link href="/homes" className="listing-back">
        ← Back to homes
      </Link>
      <PhotoGallery images={images?.length ? images : [image]} alt={imageAlt} />
      <h1>{name}</h1>
      <p className="listing-meta">
        {type} · {[location.area, location.city].filter(Boolean).join(", ")}
      </p>
      {location.address && <p>{location.address}</p>}
      <p className="listing-price">
        {formatNaira(discountedPrice(property))}
        {discount ? <s>{formatNaira(price)}</s> : null}
      </p>
      <BookingForm
        listingId={property.id}
        maxGuests={property.maxGuests ?? 1}
        isLoggedIn={!!session?.user}
      />
    </article>
  );
}
