// Not a server action: only `generateTrip` calls it, with GeoNames' name for the place.
import { getPlaiceholder } from "plaiceholder";
import { imageDataFixture, useE2EFixtures } from "./e2eFixtures";

// One per trip-page photo slot, the sixth included.
const PHOTOS = 6;

type UnsplashSearch = { results: { urls: { regular: string } }[] };

export const fetchTripImage = async (city: string) => {
  if (useE2EFixtures) return imageDataFixture;

  try {
    const params = new URLSearchParams({
      client_id: process.env.UNSPLASH_API_KEY ?? "",
      query: city,
      per_page: String(PHOTOS),
    });
    const search = await fetch(`https://api.unsplash.com/search/photos?${params}`);
    if (!search.ok) throw new Error(`Unsplash: ${search.status}`);
    const { results }: UnsplashSearch = await search.json();
    if (!results.length) throw new Error(`Unsplash: no photos of ${city}`);

    const tripImages = results.slice(0, PHOTOS).map((result) => result.urls.regular);

    const image = await fetch(tripImages[0]);
    if (!image.ok) throw new Error(`Unsplash image: ${image.status}`);
    const { base64: placeholder } = await getPlaiceholder(Buffer.from(await image.arrayBuffer()));

    return { tripImages, placeholder };
  } catch (error: unknown) {
    console.error(error);
    throw new Error("Error fetching image");
  }
};
