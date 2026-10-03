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

/**
 * The app's footer, shared by every route. Lifted out of `landing/` unchanged
 * when the shell became shared; the only addition is `font-sorbet`, so it still
 * renders in Rubik on a page that has not opted in at its own root yet.
 */
function SiteFooter() {
  return (
    <footer className="bg-sorbet-ink px-5 py-16 font-sorbet text-sorbet-offwhite antialiased sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:justify-between">
        <div>
          <p className="text-3xl font-extrabold tracking-[-0.03em]">trip ai</p>
          <p className="mt-3 max-w-xs text-sm text-sorbet-offwhite/60">
            The travel guide powered by AI.
          </p>
        </div>

        <div className="flex gap-12 sm:gap-20">
          {columns.map((column) => (
            <div key={column.heading}>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-sorbet-offwhite/45">
                {column.heading}
              </p>
              <ul className="mt-4 grid gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-sorbet-offwhite/80 transition-colors hover:text-sorbet-offwhite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-lime"
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

export default SiteFooter;
