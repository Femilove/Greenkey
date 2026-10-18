import type { MetadataRoute } from "next";
import { searchListings } from "@/lib/listings";
import { SITE_URL } from "@/lib/siteUrl";

export const dynamic = "force-dynamic"; // always list the current approved homes

const STATIC_PAGES = ["", "/homes", "/about", "/how-we-work", "/content-guidelines", "/contact", "/partner-dispute", "/terms", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" || path === "/homes" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/homes" ? 0.9 : 0.4,
  }));

  try {
    const listings = await searchListings({ limit: 1000 });
    return [...pages, ...listings.map((l) => ({ url: `${SITE_URL}/listings/${l.id}`, changeFrequency: "weekly" as const, priority: 0.8 }))];
  } catch {
    return pages; // if the database is unreachable, still serve the static pages
  }
}
