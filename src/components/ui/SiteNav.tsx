"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { href: "/form", label: "New trip" },
  { href: "/saved-trips", label: "Saved trips" },
  { href: "/about", label: "About" },
];

/** `/saved-trips/42` marks `/saved-trips` active; `/` only matches itself. */
function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The app's one nav bar, rendered from the root layout for every route.
 *
 * Generalised from `LandingNav`: same canvas/blur bar, same pill links, plus a
 * `usePathname` active state and a disclosure menu below `md`. There is no
 * `pathname === "/"` escape hatch any more — the landing wears this nav like
 * every other page, which is why `NavbarComponent` could go.
 *
 * Below `md` the bar is the wordmark and the trigger; the three links and the
 * "Plan a trip" pill live in the panel. Hiding them is CSS (`md:hidden` /
 * `hidden md:…`) rather than a `matchMedia` branch, so the server and client
 * render the same tree.
 */
function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // The panel's links are client-side pushes, so nothing unmounts on its own.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Focus was inside the panel that is about to leave; put it back on the
      // control that opened it rather than letting it fall to <body>.
      triggerRef.current?.focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-sorbet-canvas/90 font-sorbet text-sorbet-ink antialiased backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sorbet-ink"
        >
          <span className="grid size-7 place-items-center rounded-lg bg-sorbet-orchid text-[0.6rem] font-extrabold text-sorbet-ink">
            ai
          </span>
          {/* data-wordmark: the intro measures this to know where to fly to. */}
          <span
            data-wordmark
            className="text-lg font-extrabold tracking-tight text-sorbet-ink"
          >
            trip ai
          </span>
        </Link>

        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-sorbet-ink/5 hover:text-sorbet-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink ${
                  isActive(pathname, link.href)
                    ? "bg-sorbet-ink/5 text-sorbet-ink"
                    : "text-sorbet-ink/70"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/form"
          className="ml-3 hidden rounded-full bg-sorbet-ink px-5 py-2.5 text-sm font-semibold text-sorbet-offwhite transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink md:block"
        >
          Plan a trip
        </Link>

        <button
          ref={triggerRef}
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          className="ml-auto rounded-full border border-sorbet-ink/20 px-4 py-2 text-sm font-medium text-sorbet-ink transition-colors hover:bg-sorbet-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink md:hidden"
        >
          Menu
        </button>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="site-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-sorbet-canvas md:hidden"
          >
            <ul className="mx-auto grid max-w-6xl gap-1.5 px-5 pb-6 pt-2 sm:px-8">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={
                      isActive(pathname, link.href) ? "page" : undefined
                    }
                    className={`block rounded-full px-4 py-3 text-lg font-medium transition-colors hover:bg-sorbet-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink ${
                      isActive(pathname, link.href)
                        ? "bg-sorbet-ink/5 text-sorbet-ink"
                        : "text-sorbet-ink/70"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-1.5">
                <Link
                  href="/form"
                  onClick={() => setOpen(false)}
                  className="block rounded-full bg-sorbet-ink px-4 py-3 text-center text-lg font-semibold text-sorbet-offwhite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink"
                >
                  Plan a trip
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default SiteNav;
