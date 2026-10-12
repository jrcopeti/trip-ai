import { travelPhotos, type TravelPhoto } from "@/data";

/**
 * Picks one of the bundled travel photos on the server — `/about`'s photo and the
 * landing's band — so the page renders it in the first byte instead of gating on
 * a mount effect. The caller's page must render per request (`connection()`),
 * or the pick happens once at build time.
 *
 * `random` is injectable so the tests can pin both ends of the range.
 */
function pickTravelPhoto(random: () => number = Math.random): TravelPhoto {
  const index = Math.min(
    Math.floor(random() * travelPhotos.length),
    travelPhotos.length - 1,
  );

  return travelPhotos[index];
}

export default pickTravelPhoto;
