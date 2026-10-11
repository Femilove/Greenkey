import Link from "next/link";

const LINKS = [
  { label: "Ibadan hotels", city: "ibadan" },
  { label: "Lekki hotels", city: "lagos" },
  { label: "Port harcourt hotels", city: "port-harcourt" },
  { label: "Enugu hotel", city: "enugu" },
  { label: "Ikeja hotels", city: "lagos" },
  { label: "Maitama hotels", city: "abuja" },
  { label: "Guzape hotels", city: "abuja" },
  { label: "Wuse II hotels", city: "abuja" },
  { label: "Woji hotel", city: "port-harcourt" },
  { label: "Old GRA hotel", city: "port-harcourt" },
];

export default function Recommendations() {
  return (
    <section
      className="recommendations"
      aria-labelledby="recommendations-heading"
    >
      <h2 id="recommendations-heading">Recommendations</h2>
      <div className="recommendation-links">
        {LINKS.map(({ label, city }) => (
          <Link key={label} href={`/homes?location=${city}&type=hotel`}>
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
