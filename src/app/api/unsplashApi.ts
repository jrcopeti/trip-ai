"use server";
import { getPlaiceholder } from "plaiceholder";
import { imageDataFixture, useE2EFixtures } from "./e2eFixtures";

type UnsplashSearch = { results: { urls: { regular: string } }[] };

export const fetchTripImage = async (city: string) => {
  if (useE2EFixtures) return imageDataFixture;

  try {
    const params = new URLSearchParams({
      client_id: process.env.UNSPLASH_API_KEY ?? "",
      query: city,
    });
    const search = await fetch(`https://api.unsplash.com/search/photos?${params}`);
    if (!search.ok) throw new Error(`Unsplash: ${search.status}`);
    const { results }: UnsplashSearch = await search.json();
    if (!results.length) throw new Error(`Unsplash: no photos of ${city}`);

    const [tripImage, tripImage2, tripImage3, tripImage4, tripImage5] = [0, 5, 2, 3, 4].map(
      (i) => results[i]?.urls.regular,
    );

    const image = await fetch(tripImage);
    if (!image.ok) throw new Error(`Unsplash image: ${image.status}`);
    const { base64: placeholder } = await getPlaiceholder(Buffer.from(await image.arrayBuffer()));

    return { tripImage, tripImage2, tripImage3, tripImage4, tripImage5, placeholder };
  } catch (error: unknown) {
    console.error(error);
    throw new Error("Error fetching image");
  }
};
