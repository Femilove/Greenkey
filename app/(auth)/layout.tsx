import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="signin-header">
        <nav className="signin-navbar" aria-label="Sign in navigation">
          <details className="support-menu">
            <summary>
              Support <span aria-hidden="true">⌄</span>
            </summary>
            <div className="support-links">
              <Link href="/how-we-work">Help and support</Link>
              <Link href="/contact">Contact Us</Link>
              {/* <Link href="/partner-dispute">Partner dispute</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Notice</Link> */}
            </div>
          </details>
          <Link className="home-button" href="/" aria-label="Return to home">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 11.5 12 4l9 7.5v8.25a.75.75 0 0 1-.75.75h-5.5v-5.75h-5.5v5.75h-5.5a.75.75 0 0 1-.75-.75V11.5Z" />
            </svg>
          </Link>
        </nav>
      </header>
      <main className="signin-main">{children}</main>
    </>
  );
}
