"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/browse", label: "Browse" },
  { href: "/my-lists", label: "My Lists" },
  { href: "/coming-soon", label: "Coming Soon" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight">
          Rotting Nights
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition hover:text-accent ${
                pathname === link.href ? "text-accent" : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {status === "authenticated" ? (
            <>
              <span className="text-sm text-muted">{session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-accent"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-background transition hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-border px-4 py-3 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                pathname === link.href ? "bg-surface text-accent" : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-border pt-2">
            {status === "authenticated" ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted"
              >
                Sign out ({session.user?.name})
              </button>
            ) : (
              <Link
                href="/signin"
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-accent px-3 py-2 text-center text-sm font-medium text-background"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
