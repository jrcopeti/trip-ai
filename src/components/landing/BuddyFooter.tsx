import Link from "next/link";

const columns = [
  {
    heading: "Plan",
    links: [
      { href: "/form", label: "New trip" },
      { href: "/saved-trips", label: "Saved trips" },
    ],
  },
  {
    heading: "About",
    links: [
      { href: "/about", label: "What this is" },
    ],
  },
];

function BuddyFooter() {
  return (
    <footer className="bg-buddy-ink px-5 py-16 text-buddy-offwhite sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:justify-between">
        <div>
          <p className="text-3xl font-extrabold tracking-[-0.03em]">trip ai</p>
          <p className="mt-3 max-w-xs text-sm text-buddy-offwhite/60">
            The travel guide powered by AI.
          </p>
        </div>

        <div className="flex gap-12 sm:gap-20">
          {columns.map((column) => (
            <div key={column.heading}>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-buddy-offwhite/45">
                {column.heading}
              </p>
              <ul className="mt-4 grid gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-buddy-offwhite/80 transition-colors hover:text-buddy-offwhite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-buddy-lime"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default BuddyFooter;
