/**
 * Remembers that a browser has seen the landing intro, so it plays at most once
 * a day rather than on every visit.
 *
 * A cookie, not localStorage: the server reads it and leaves the overlay out of
 * the HTML. With localStorage the server could not know, would render the
 * curtain, and the client would pull it down after hydration — a flash of ink on
 * every repeat visit.
 */
export const INTRO_COOKIE = "trip-ai-intro-seen";

/** A day: long enough to skip it on repeat visits, short enough that it greets a returning visitor. */
export const INTRO_COOKIE_MAX_AGE_S = 60 * 60 * 24;

/** What `Intro` writes to `document.cookie` when it starts. */
export const introSeenCookie = `${INTRO_COOKIE}=1; Path=/; Max-Age=${INTRO_COOKIE_MAX_AGE_S}; SameSite=Lax`;

/** Reads the cookie's value, as `cookies().get(INTRO_COOKIE)?.value` gives it. */
export function hasSeenIntro(value: string | undefined): boolean {
  return value === "1";
}
