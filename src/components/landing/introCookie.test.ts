import { describe, expect, it } from "vitest";
import {
  INTRO_COOKIE,
  INTRO_COOKIE_MAX_AGE_S,
  hasSeenIntro,
  introSeenCookie,
} from "./introCookie";

describe("introCookie", () => {
  it("counts the intro as seen only when the cookie says so", () => {
    expect(hasSeenIntro("1")).toBe(true);
    expect(hasSeenIntro(undefined)).toBe(false);
    expect(hasSeenIntro("")).toBe(false);
    expect(hasSeenIntro("0")).toBe(false);
  });

  it("writes a site-wide cookie that lasts 24 hours", () => {
    expect(INTRO_COOKIE_MAX_AGE_S).toBe(24 * 60 * 60);
    expect(introSeenCookie).toMatch(new RegExp(`^${INTRO_COOKIE}=1;`));
    expect(introSeenCookie).toContain("Path=/");
    expect(introSeenCookie).toContain("Max-Age=86400");
    expect(introSeenCookie).toContain("SameSite=Lax");
  });
});
