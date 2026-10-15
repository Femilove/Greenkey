"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "All", href: "/" },
  { label: "Homes", href: "/homes" },
  { label: "Rentage", href: "/rentage/register" },
  { label: "Services", href: "/#services" },
];

const ACCOUNT_LINKS = [
  { label: "Account", href: "/account" },
  { label: "Bookings", href: "/bookings" },
  { label: "Reward and Wallet", href: "/rewards-wallet" },
  { label: "Reviews", href: "/reviews" },
  { label: "Bookmarked", href: "/saved" },
  { label: "Promo codes", href: "/promo-codes" },
];

const HOME_PATH =
  "M3 11.5 12 4l9 7.5v8.25a.75.75 0 0 1-.75.75h-5.5v-5.75h-5.5v5.75h-5.5a.75.75 0 0 1-.75-.75V11.5Z";

export default function Navbar({
  isLoggedIn = false,
  role,
}: {
  isLoggedIn?: boolean;
  role?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Primary navigation">
        <Link className="nav-icon" href="/" aria-label="Air home">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={HOME_PATH} />
          </svg>
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                className={`nav-link${active ? " active" : ""}`}
                href={href}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="nav-actions">
          {role === "owner" ? (
            <Link className="add-rental" href="/dashboard">
              Dashboard
            </Link>
          ) : role === "admin" ? (
            <Link className="add-rental" href="/admin">
              Admin
            </Link>
          ) : (
            <Link className="add-rental" href="/rentage/register">
              Add a rental
            </Link>
          )}

          {isLoggedIn ? (
            <div className="profile-menu" ref={menuRef}>
              <button
                ref={triggerRef}
                className="profile-trigger"
                type="button"
                aria-label="Open account menu"
                aria-expanded={open}
                aria-controls="account-menu"
                onClick={() => setOpen((v) => !v)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
                </svg>
              </button>
              <div
                className="account-menu"
                id="account-menu"
                role="menu"
                hidden={!open}
              >
                {/* On phones the header link above is hidden, so owners and admins reach their area from here. */}
                {role === "owner" && (
                  <Link
                    className="account-menu-mobile"
                    href="/dashboard"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                {role === "admin" && (
                  <Link
                    className="account-menu-mobile"
                    href="/admin"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                {ACCOUNT_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link className="action-button" href="/register">
                Register
              </Link>
              <Link className="action-button" href="/login">
                Sign in
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
