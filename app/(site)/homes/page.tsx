import BookingPanel from "@/components/BookingPanel";
import PropertyGrid from "@/components/PropertyGrid";
import { searchListings } from "@/lib/listings";
import { cityFromSlug, ISO_DATE, nightsBetween } from "@/types/property";

export const metadata = { title: "Homes | Avenir" };

type Params = {
  location?: string;
  type?: string;
  people?: string;
  rooms?: string;
  "check-in"?: string;
  "check-out"?: string;
};

const positiveInt = (v?: string) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
};
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

export default async function HomesPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const q = await searchParams;
  const city = cityFromSlug(q.location ?? ""); // undefined for "all" or unknown values
  const term = q.type?.toLowerCase();
  const people = positiveInt(q.people);
  const rooms = positiveInt(q.rooms);

  // Ignore dates unless both are valid and check-out is after check-in.
  const inD = q["check-in"] ?? "";
  const outD = q["check-out"] ?? "";
  const hasDates = ISO_DATE.test(inD) && ISO_DATE.test(outD) && outD > inD;

  const results = await searchListings({
    city,
    term,
    people,
    rooms,
    checkIn: hasDates ? inD : undefined,
    checkOut: hasDates ? outD : undefined,
  });

  const summary = [
    city ?? "All locations",
    hasDates
      ? `${shortDate(inD)} – ${shortDate(outD)} (${nightsBetween(inD, outD)} nights)`
      : null,
    `${people} ${people === 1 ? "guest" : "guests"}`,
    `${rooms} ${rooms === 1 ? "room" : "rooms"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="homes-page">
      <BookingPanel
        key={JSON.stringify(q)}
        initial={{
          location: city ? q.location : "all",
          checkIn: hasDates ? inD : "",
          checkOut: hasDates ? outD : "",
          people,
          rooms,
        }}
      />
      <h1>{city ? `Homes in ${city}` : "All homes"}</h1>
      <p className="homes-count">
        {results.length} {results.length === 1 ? "place" : "places"} found ·{" "}
        {summary}
      </p>
      {results.length ? (
        <PropertyGrid properties={results} />
      ) : (
        <p>
          No homes match those dates and guests. Try different dates, fewer
          rooms, or another location.
        </p>
      )}
    </section>
  );
}
