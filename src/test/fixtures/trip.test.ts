import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LOCAL_IMAGES } from "./trip";

// The seed and E2E_FIXTURES serve these from `public/`; a missing file only
// shows up as a broken photo in the browser, so it is checked here.
describe("LOCAL_IMAGES", () => {
  it.each(LOCAL_IMAGES)("%s is a file under public/", (src) => {
    expect(existsSync(path.join(process.cwd(), "public", src))).toBe(true);
  });

  it("are distinct", () => {
    expect(new Set(LOCAL_IMAGES).size).toBe(LOCAL_IMAGES.length);
  });
});
