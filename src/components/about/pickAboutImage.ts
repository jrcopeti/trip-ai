import { travelPhotos, type TravelPhoto } from "@/data";

/**
 * Picks the `/about` photo on the server, so the page renders it in the first
 * byte instead of gating on a mount effect.
 *
 * `random` is injectable so the tests can pin both ends of the range.
 */
function pickAboutImage(random: () => number = Math.random): TravelPhoto {
  const index = Math.min(
    Math.floor(random() * travelPhotos.length),
    travelPhotos.length - 1,
  );

  return travelPhotos[index];
}

export default pickAboutImage;
