import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

/**
 * The fan, by index — the Hero deck's tilt vocabulary. Every angle is
 * `sm:`-prefixed: below `sm` a rotated card overflows the 20px gutter at 390px.
 */
export const POLAROID_TILT = [
  "sm:-rotate-2",
  "sm:rotate-1",
  "sm:-rotate-1",
  "sm:rotate-2",
] as const;

const SHADOW = "shadow-[0_18px_40px_-24px_rgba(48,46,45,0.55)]";

type Common = {
  image: string | StaticImageData;
  /** Base64 blur for `next/image`. */
  placeholder: string;
  /** Handwritten on the lip. */
  caption: string;
  /** Empty when the caption already names what is in frame. */
  alt?: string;
};

type CardProps = Common & {
  size?: "card";
  href: string;
  username: string;
  /** Position in the grid; picks the fan angle, wrapping every four. */
  index: number;
};

type LargeProps = Common & {
  size: "lg";
};

type Props = CardProps | LargeProps;

/**
 * A photo on white paper with a fat bottom lip and a handwritten caption.
 *
 * `card` (the default) is a saved-trip tile: the whole thing is a link, tilted on
 * a fan from `sm` up, straightening and lifting on hover. `lg` is the trip title on
 * both trip routes: same frame, wider, the caption is the page's h1, not a link;
 * it rests on the fan's first angle and straightens on hover like the cards.
 *
 * The entrance is the caller's: wrap it in `Reveal`.
 */
function Polaroid(props: Props) {
  const { image, placeholder, caption, alt = "" } = props;

  if (props.size === "lg") {
    return (
      // Rests on the fan's first angle and straightens and lifts on hover, as the
      // saved-trips cards do; untilted below `sm` for the same gutter reason.
      <article
        className={`w-full max-w-md rounded-2xl bg-white p-3 pb-0 transition-transform duration-300 hover:-translate-y-2 sm:hover:rotate-0 motion-reduce:transition-none ${POLAROID_TILT[0]} ${SHADOW}`}
      >
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <Image
            src={image}
            alt={alt}
            fill
            priority
            placeholder="blur"
            blurDataURL={placeholder}
            sizes="(min-width: 768px) 448px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="px-1 pb-4 pt-3">
          <h1 className="font-sorbet-hand text-[clamp(1.75rem,4vw,2.75rem)] leading-none text-balance text-sorbet-ink">
            {caption}
          </h1>
        </div>
      </article>
    );
  }

  const { href, username, index } = props;
  const tilt = POLAROID_TILT[index % POLAROID_TILT.length];

  return (
    // Named explicitly: Chromium does not compute a link's name from content
    // inside an `<article>`, so without this every card is an unnamed link to a
    // screen reader (jsdom does, which is why the unit tests never saw it).
    <Link
      href={href}
      aria-label={`${caption}, ${username}`}
      className={`block rounded-2xl transition-transform duration-300 hover:-translate-y-2 sm:hover:rotate-0 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sorbet-ink ${tilt}`}
    >
      <article className={`rounded-2xl bg-white p-3 pb-0 ${SHADOW}`}>
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <Image
            src={image}
            alt={alt}
            fill
            placeholder="blur"
            blurDataURL={placeholder}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex items-end justify-between gap-2 px-1 pb-4 pt-3">
          <div className="min-w-0">
            <h2 className="font-sorbet-hand text-2xl leading-none text-sorbet-ink capitalize">
              {caption}
            </h2>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/45">
              {username}
            </p>
          </div>
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-full bg-sorbet-ink text-sorbet-offwhite"
          >
            <FaArrowRight size={12} />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default Polaroid;
