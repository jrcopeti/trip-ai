import { describe, expect, it } from "vitest";
import { stubSrc } from "@/test/imageStub";
import { LOCAL_IMAGES, generatedTripFixture, makeTrip } from "@/test/fixtures";
import { defaultPlaceholder } from "@/lib/constants";
import { tripPhoto } from "./tripPhoto";

describe("tripPhoto", () => {
  it("gives the trip's own photo for the slot, behind the row's placeholder", () => {
    const trip = makeTrip({ tripImages: [...LOCAL_IMAGES], placeholder: "data:image/png;base64,row" });

    expect(tripPhoto(trip, 2)).toEqual({
      src: LOCAL_IMAGES[2],
      blurDataURL: "data:image/png;base64,row",
    });
    expect(tripPhoto(trip, 5)?.src).toBe(LOCAL_IMAGES[5]);
  });

  it("uses the default blur when the row has no placeholder", () => {
    expect(tripPhoto(makeTrip({ placeholder: null }), 0).blurDataURL).toBe(defaultPlaceholder);
  });

  it.each([
    [0, "1.jpg"],
    [1, "2.jpg"],
    [2, "3.jpg"],
    [3, "4.jpg"],
    [4, "9.jpg"],
  ] as const)("falls back in slot %i to %s, behind its own blur", (slot, file) => {
    const photo = tripPhoto(makeTrip({ tripImages: [] }), slot);

    expect(photo.src).toMatchObject({ src: stubSrc(file) });
    expect(photo.blurDataURL).toBe(`data:image/png;base64,${file}`);
  });

  it("has nothing for the sixth slot of a row with five", () => {
    expect(tripPhoto(makeTrip(), 5)).toBeUndefined();
    expect(tripPhoto(generatedTripFixture, 5)).toBeDefined();
  });
});
