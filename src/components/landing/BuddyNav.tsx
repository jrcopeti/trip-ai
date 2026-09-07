import Link from "next/link";

const links = [
  { href: "/form", label: "New trip" },
  { href: "/saved-trips", label: "Saved trips" },
  { href: "/about", label: "About" },
];

function BuddyNav() {
  return (
    <header className="sticky top-0 z-50 bg-buddy-canvas/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-buddy-ink"
        >
          <span className="grid size-7 place-items-center rounded-lg bg-buddy-orchid text-[0.6rem] font-extrabold text-buddy-ink">
            ai
          </span>
          <span className="text-lg font-extrabold tracking-tight text-buddy-ink">
            trip ai
          </span>
        </Link>

        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-buddy-ink/70 transition-colors hover:bg-buddy-ink/5 hover:text-buddy-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-buddy-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/form"
          className="ml-auto rounded-full bg-buddy-ink px-5 py-2.5 text-sm font-semibold text-buddy-offwhite transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-buddy-ink md:ml-3"
        >
          Plan a trip
        </Link>
      </nav>
    </header>
  );
}

export default BuddyNav;
