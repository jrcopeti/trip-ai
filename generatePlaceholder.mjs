import fs from "fs/promises";
import path from "path";
import { getPlaiceholder } from "plaiceholder";

/**
 * Generates the blur `placeholder` for every photo in src/assets/homepage and
 * writes `{ "<file>": "<base64>" }` to ./placeholders.json. Copy each value
 * into its `travelPhotos` entry in src/data/index.ts.
 *
 *   node generatePlaceholder.mjs
 */
async function generatePlaceholders() {
  const imagesPath = path.join(process.cwd(), "src", "assets", "homepage");
  const files = (await fs.readdir(imagesPath))
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const results = {};

  for (const file of files) {
    try {
      const buffer = await fs.readFile(path.join(imagesPath, file));
      const { base64 } = await getPlaiceholder(buffer);
      results[file] = base64;
    } catch (err) {
      console.error(`Failed to generate placeholder for ${file}: ${err}`);
    }
  }

  await fs.writeFile("./placeholders.json", JSON.stringify(results, null, 2));
  console.log(`Placeholders for ${Object.keys(results).length} photos saved.`);
}

generatePlaceholders();
