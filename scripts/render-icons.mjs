/**
 * Renders the app icons from `src/assets/logo.png`: the same lime tile with
 * the ink glyph that `Logo` draws in the page. Run once after the logo or the
 * palette changes:
 *
 *   node scripts/render-icons.mjs
 *
 * Writes `src/app/icon.png` (rounded tile, transparent corners) and
 * `src/app/apple-icon.png` (a full square — iOS rounds it itself, and fills
 * transparent corners with black). Colours are read from the `@theme` block
 * in `globals.css`, so the icon and the page cannot drift apart.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const css = await readFile(`${root}src/app/globals.css`, "utf8");

function token(name) {
  const match = css.match(new RegExp(`--color-sorbet-${name}:\\s*(#[0-9a-f]{6})`, "i"));
  if (!match) throw new Error(`--color-sorbet-${name} not found in globals.css`);
  return match[1];
}

const lime = token("lime");
const ink = token("ink");

/** The logo's alpha channel as an ink-coloured glyph, `size` pixels square. */
async function glyph(size) {
  const alpha = await sharp(`${root}src/assets/logo.png`)
    .resize(size, size)
    .extractChannel("alpha")
    .toBuffer();

  return sharp({ create: { width: size, height: size, channels: 3, background: ink } })
    .joinChannel(alpha)
    .png()
    .toBuffer();
}

/**
 * The tile at `size`, glyph inset by the same share `Logo`'s lockup uses
 * (`p-4` on `size-24`, a sixth each side). `radius` 0 is a plain square.
 */
async function tile(size, radius) {
  const inset = Math.round(size / 6);
  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect width="${size}" height="${size}" rx="${radius}" fill="${lime}"/></svg>`,
  );

  return sharp(background)
    .composite([{ input: await glyph(size - inset * 2), top: inset, left: inset }])
    .png();
}

// `rounded-3xl` on `size-24`: 24px of 96, a quarter.
await (await tile(512, 128)).toFile(`${root}src/app/icon.png`);
await (await tile(180, 0)).toFile(`${root}src/app/apple-icon.png`);

console.log(`icons written (lime ${lime}, ink ${ink})`);
