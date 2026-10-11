import Link from "next/link";
import { BiMessageSquareError } from "react-icons/bi";
import type { NotFoundComponentProps } from "@/types";

/**
 * The shared "this isn't here" panel — 404s, an unknown saved trip, and the
 * error boundary all render it.
 *
 * It centres in the space below the nav rather than covering the viewport: the
 * old `fixed … h-screen overflow-hidden` sat on top of the bar, so there was no
 * way back out except the one button.
 *
 * `w-full` because some callers render it inside a centring flex row — `Form`
 * does, through `Container` — where a block without a width shrinks to its
 * text and leaves the page's old gradient showing either side.
 */
function NotFoundComponent({ message, path, button }: NotFoundComponentProps) {
  return (
    <div className="grid w-full min-h-[calc(100dvh-4rem)] place-items-center bg-sorbet-canvas px-5 py-20 font-sorbet text-sorbet-ink antialiased sm:px-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
        <span aria-hidden className="text-3xl text-sorbet-alert">
          <BiMessageSquareError />
        </span>
        <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-balance">
          {message}
        </h2>
        <Link
          href={path}
          className="rounded-full bg-sorbet-ink px-7 py-4 text-base font-semibold text-sorbet-offwhite transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink"
        >
          {button}
        </Link>
      </div>
    </div>
  );
}

export default NotFoundComponent;
