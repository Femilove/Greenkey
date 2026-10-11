import Image from "next/image";

const FEATURES = [
  {
    title: "secure payments",
    text: "pay safely, everytime",
    path: "M5 7.5h14v11H5zM8 7.5V6a4 4 0 0 1 8 0v1.5M5 12h14M10 12v2h4v-2",
  },
  {
    title: "verified listing",
    text: "real properties, real people",
    path: "m3 10 9-7 9 7v10.5H14v-6H10v6H3z",
  },
  {
    title: "support",
    text: "24/7 contact support",
    path: "M20 15.5a4 4 0 0 1-4 4H9l-5 2 1.5-4A7.5 7.5 0 1 1 20 15.5ZM8 12h.01M12 12h.01M16 12h.01",
  },
  {
    title: "flexible options",
    text: "shortlet & long stays",
    path: "M3 11.5 12 4l9 7.5v8.25a.75.75 0 0 1-.75.75h-5.5v-5.75h-5.5v5.75h-5.5a.75.75 0 0 1-.75-.75zM8 12h.01M16 12h.01",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="why-choose-us" aria-labelledby="why-choose-us-heading">
      <div className="why-choose-copy">
        <h3 className="why-choose-eyebrow">Why choose us</h3>
        <h2 id="why-choose-us-heading">Where comfort meets convenience</h2>
        <h3 className="why-choose-description">
          Finding the right place shouldn&apos;t be complicated. We make it
          simple to find, book and enjoy your next stay — with trusted
          landlords, secure payments and excellent support.
        </h3>
        <div className="feature-list">
          {FEATURES.map(({ title, text, path }) => (
            <div className="feature-card" key={title}>
              <svg
                className="feature-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d={path} />
              </svg>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="why-choose-image">
        <Image
          src="/Lagos.jpg"
          alt="Comfortable rental home"
          width={600}
          height={400}
          style={{ height: "auto" }}
        />
      </div>
    </section>
  );
}
