import type { Property } from "@/types/property";

// Temporary data until listings come from MongoDB (only status "approved" is shown).
export const sampleProperties: Property[] = [
  { id: "property-1", image: "/caro1.jpg", imageAlt: "4 bed apartment", type: "house", name: "4 bed apartment", price: 500000, location: { city: "Lagos" }, bedrooms: 4, maxGuests: 8, unavailable: [{ from: "2026-10-10", to: "2026-10-20" }], status: "approved" },
  { id: "property-2", image: "/caro4.jpg", imageAlt: "3 bed apartment", type: "house", name: "3 bed apartment", price: 300000, location: { city: "Abuja" }, bedrooms: 3, maxGuests: 6, unavailable: [{ from: "2026-11-01", to: "2026-11-15" }], status: "approved" },
  { id: "property-3", image: "/hotel.jpg", imageAlt: "4 bed apartment", type: "house", name: "4 bed apartment", price: 600000, location: { city: "Ibadan" }, bedrooms: 4, maxGuests: 8, status: "approved" },
  { id: "property-4", image: "/caro2.jpg", imageAlt: "3 bed apartment", type: "house", name: "3 bed apartment", price: 300000, location: { city: "Enugu" }, bedrooms: 3, maxGuests: 6, status: "approved" },
  { id: "property-5", image: "/caro5.jpg", imageAlt: "3 bed apartment", type: "house", name: "3 bed apartment", price: 300000, location: { city: "Lagos" }, bedrooms: 3, maxGuests: 6, unavailable: [{ from: "2026-10-05", to: "2026-10-12" }], status: "approved" },
  { id: "property-6", image: "/apartment.jpg", imageAlt: "Apartment", type: "house", name: "Apartment", price: 1000000, location: { city: "Port Harcourt" }, bedrooms: 2, maxGuests: 4, status: "approved" },
  { id: "property-7", image: "/caro2.jpg", imageAlt: "3 bed apartment", type: "house", name: "3 bed apartment", price: 300000, location: { city: "Benin" }, bedrooms: 3, maxGuests: 6, status: "approved" },
  { id: "property-8", image: "/caro2.jpg", imageAlt: "3 bed apartment", type: "house", name: "3 bed apartment", price: 300000, location: { city: "Abuja" }, bedrooms: 3, maxGuests: 6, status: "approved" },
  { id: "property-9", image: "/caro2.jpg", imageAlt: "3 bed apartment", type: "house", name: "3 bed apartment", price: 300000, location: { city: "Lagos" }, bedrooms: 3, maxGuests: 6, status: "approved" },
  { id: "property-10", image: "/caro2.jpg", imageAlt: "3 bed apartment", type: "house", name: "3 bed apartment", price: 300000, location: { city: "Ibadan" }, bedrooms: 3, maxGuests: 6, status: "approved" },
];
