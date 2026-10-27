import type { ReactNode } from "react";
import Reveal from "@/components/sorbet/Reveal";
import { paragraphs } from "@/lib/utils";

/**
 * One trip-page section: a full-bleed ground, the system's gutter and rhythm, and
 * the 6xl measure. The ground is the caller's, because the pages alternate them.
 */
export function Section({ ground, children }: { ground: string; children: ReactNode }) {
  return (
    <section className={`${ground} px-5 py-20 sm:px-8 md:py-28`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/** Eyebrow plus the two-tone section h2: the claim, then the qualifier. */
export function SectionHeading({
  eyebrow,
  heading,
  children,
}: {
  eyebrow: string;
  heading: { claim: string; qualifier: string };
  /** Anything that sits beside the heading, such as a sticker. */
  children?: ReactNode;
}) {
  return (
    <Reveal>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-sorbet-ink/50">
            {eyebrow}
          </p>
          <h2 className="mt-4 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.03em] text-sorbet-ink">
            <span className="font-extrabold">{heading.claim}</span>{" "}
            <span className="font-medium text-sorbet-ink/60">{heading.qualifier}</span>
          </h2>
        </div>
        {children}
      </div>
    </Reveal>
  );
}

/**
 * A photo in the system's media frame, larger-radius than the cards beside it.
 * Portrait beside copy from `lg`; landscape when stacked, where a full-width 4:5
 * frame is taller than the screen.
 */
export function MediaFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative aspect-[16/10] w-full lg:aspect-[4/5] overflow-hidden rounded-[2rem] bg-sorbet-ink/5">
      {children}
    </div>
  );
}

/** The model's text as one `<p>` per paragraph (see `paragraphs`), or nothing when it has none. */
export function Paragraphs({ text, className }: { text: string; className: string }) {
  const items = paragraphs(text);
  if (items.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}

/** The line a section shows instead of its content when there is none to show. */
export function SectionNotice({ children }: { children: ReactNode }) {
  return (
    <p className="mt-10 flex items-center gap-2 text-lg font-medium text-sorbet-ink/70">
      {children}
    </p>
  );
}
