import { defaultPlaceholder } from "@/lib/constants";
import { LOCAL_IMAGES } from "./trip";
import type { ImageDataTypes } from "@/types";

/**
 * What `fetchTripImage` resolves to: five Unsplash URLs plus a blur placeholder.
 *
 * Left un-annotated so it infers as all-strings — that is what the API module
 * actually returns, and a mocked `mockResolvedValue` is typed against it.
 * `satisfies` still holds it to the context's shape, which permits nulls.
 *
 * The placeholder is the app's real default rather than a made-up string: under
 * `E2E_FIXTURES` this feeds `next/image` with `placeholder="blur"`, which decodes
 * the value and fails on anything that is not a genuine base64 image.
 */
export const imageDataFixture = {
  tripImages: [...LOCAL_IMAGES],
  placeholder: defaultPlaceholder,
} satisfies ImageDataTypes;
