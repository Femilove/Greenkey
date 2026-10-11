export const CITIES = ["Abuja", "Ibadan", "Enugu", "Lagos", "Port Harcourt", "Benin"] as const;
export type City = (typeof CITIES)[number];

export const citySlug = (city: string) => city.trim().toLowerCase().replace(/\s+/g, "-");
export const cityFromSlug = (slug: string): City | undefined =>
  CITIES.find((city) => citySlug(city) === slug.toLowerCase());

export interface PropertyLocation {
  city: City;
  area?: string;
  address?: string;
}

export const MAX_PHOTOS = 10;

export type ListingStatus = "pending" | "approved" | "rejected";

export interface Property {
  id: string;
  image: string; // the cover photo: the first one the owner uploaded
  images?: string[]; // every photo in order, cover first (listing page gallery)
  imageAlt: string;
  type: string;
  name: string;
  price: number;
  discount?: number; // percentage, e.g. 10 = 10% off
  location: PropertyLocation;
  bedrooms?: number;
  maxGuests?: number;
  unavailable?: { from: string; to: string }[]; // booked ranges, check-out day is free (YYYY-MM-DD)
  status?: ListingStatus; // only "approved" should appear on the public site
}

export const formatNaira = (amount?: number) => `NGN ${(amount ?? 0).toLocaleString("en-NG")}`;
export const discountedPrice = (p: Pick<Property, "price" | "discount">) =>
  p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price;

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** True if [checkIn, checkOut) doesn't overlap any booked range. */
export const isAvailable = (p: Pick<Property, "unavailable">, checkIn: string, checkOut: string) =>
  !(p.unavailable ?? []).some((r) => checkIn < r.to && checkOut > r.from);

export const nightsBetween = (checkIn: string, checkOut: string) =>
  Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000);
