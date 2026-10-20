import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * What step 6 of the sorbet migration removed, kept removed. A source scan
 * rather than a component test: the regressions it catches are an import or a
 * class name coming back, which no render would notice.
 */

const root = join(__dirname, "..", "..");
const src = join(root, "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css|mjs)$/.test(name) ? [path] : [];
  });
}

// This file names everything it forbids, so it is the one file not scanned.
const files = sourceFiles(src)
  .filter((path) => path !== __filename)
  .map((path) => ({ path: relative(root, path), text: readFileSync(path, "utf8") }));

function offenders(pattern: RegExp) {
  return files.filter(({ text }) => pattern.test(text)).map(({ path }) => path);
}

const REMOVED_DEPS = [
  "gsap",
  "@gsap/react",
  "locomotive-scroll",
  "swiper",
  "daisyui",
  "react-spinners",
];

const OLD_PALETTES = [
  "gallery",
  "neptune",
  "tuna",
  "shark",
  "yellorange",
  "deeporange",
  "cabaret",
  "violay",
];

describe("the old look is gone", () => {
  it("imports none of the removed packages", () => {
    // `from "x"`, a bare `import "x/css"`, and `import("x")` / `require("x")`.
    const imports = new RegExp(
      `(from|import\\(?|require\\()\\s*["'](${REMOVED_DEPS.map((d) => d.replace("/", "\\/")).join("|")})(\\/[^"']*)?["']`,
    );

    expect(offenders(imports)).toEqual([]);
  });

  it("no longer lists them in package.json", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const listed = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

    expect(listed.filter((dep) => REMOVED_DEPS.includes(dep))).toEqual([]);
  });

  it("uses no old-palette colour, as a class or a token", () => {
    const palette = new RegExp(`-(${OLD_PALETTES.join("|")})-\\d{2,3}\\b`);

    expect(offenders(palette)).toEqual([]);
  });

  it("loads no old font", () => {
    expect(offenders(/Red_Hat_Display|League_Spartan|\bInter\(/)).toEqual([]);
  });

  it("has no `data-sorbet` scope left, now HeroUI is sorbet on :root", () => {
    expect(offenders(/data-sorbet/)).toEqual([]);
  });
});

// A custom toast shown another way stays drawn and focusable for 1s once dismissed; a removed
// one, if under the cursor, leaves the Toaster's hover pause on and every later toast stuck.
describe("toasts", () => {
  const app = files.filter(({ path }) => !/\.test\.tsx?$/.test(path));

  it("are shown only through `showToast`", () => {
    // `toast(…)` and each of its makers; not `showToast(` or another name ending in "toast".
    const shown = /(?<![\w.])toast(\.(custom|success|error|loading|promise))?\(/;
    const direct = app.filter(
      ({ path, text }) => shown.test(text) && !path.endsWith("ui/ToastCard.tsx"),
    );
    expect(direct.map(({ path }) => path)).toEqual([]);
  });

  it("are dismissed, never removed", () => {
    expect(app.filter(({ text }) => /toast\.remove\(/.test(text)).map(({ path }) => path)).toEqual([]);
  });
});
