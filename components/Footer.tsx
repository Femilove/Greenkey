import Link from "next/link";

type FooterLink = string | { label: string; href: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Support",
    links: [
      { label: "Manage your bookings", href: "/bookings" },
      { label: "Contact Customer Service", href: "/contact" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "New apartments in your city", href: "/homes" },
      { label: "List Property", href: "/rentage/register" },
      "Reservations",
      "Promo deals",
    ],
  },
  {
    title: "Terms and settings",
    links: [
      { label: "Privacy Notice", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Partner dispute", href: "/partner-dispute" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Avenir", href: "/about" },
      { label: "How we work", href: "/how-we-work" },
      { label: "Content guidelines", href: "/content-guidelines" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      {COLUMNS.map(({ title, links }) => (
        <div className="footer-column" key={title}>
          <h3>{title}</h3>
          <ul>
            {links.map((link) => {
              const { label, href } =
                typeof link === "string" ? { label: link, href: "#" } : link;
              return (
                <li key={label}>
                  <Link href={href}>{label}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </footer>
  );
}
