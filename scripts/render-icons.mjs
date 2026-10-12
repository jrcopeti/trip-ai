/**
 * Renders the app icons from `src/assets/logo.png`, as drawn: its own teal
 * gradient on a transparent ground, no tile. Run once after the logo changes:
 *
 *   node scripts/render-icons.mjs
 *
 * Writes `src/app/icon.png` (the tab favicon, 512px) and
 * `src/app/apple-icon.png` (180px).
 */
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const logo = `${root}src/assets/logo.png`;

await sharp(logo).resize(512, 512).png().toFile(`${root}src/app/icon.png`);
await sharp(logo).resize(180, 180).png().toFile(`${root}src/app/apple-icon.png`);

console.log("icons written (logo.png as drawn)");
