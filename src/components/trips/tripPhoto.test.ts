import { describe, expect, it } from "vitest";
import { stubSrc } from "@/test/imageStub";
import { LOCAL_IMAGES, generatedTripFixture, makeTrip } from "@/test/fixtures";
import { defaultPlaceholder } from "@/lib/constants";
import { tripPhoto } from "./tripPhoto";

describe("tripPhoto", () => {
  it("gives the trip's own photo for the slot, behind the row's placeholder", () => {
    const trip = makeTrip({ tripImages: [...LOCAL_IMAGES], placeholder: "data:image/png;base64,row" });

    expect(tripPhoto(trip, "afterTours")).toEqual({
      src: LOCAL_IMAGES[2],
      blurDataURL: "data:image/png;base64,row",
    });
    expect(tripPhoto(trip, "afterEssentials")?.src).toBe(LOCAL_IMAGES[5]);
  });

  it("uses the default blur when the row has no placeholder", () => {
    expect(tripPhoto(makeTrip({ placeholder: null }), "title").blurDataURL).toBe(defaultPlaceholder);
  });

  it.each([
    ["title", "1.jpg"],
    ["description", "2.jpg"],
    ["afterTours", "3.jpg"],
    ["details", "4.jpg"],
    ["closing", "9.jpg"],
  ] as const)("falls back in %s to %s, behind its own blur", (slot, file) => {
    const photo = tripPhoto(makeTrip({ tripImages: [] }), slot);

    expect(photo.src).toMatchObject({ src: stubSrc(file) });
    expect(photo.blurDataURL).toBe(`data:image/png;base64,${file}`);
  });

  it("has nothing after the essentials for a row with five", () => {
    expect(tripPhoto(makeTrip(), "afterEssentials")).toBeUndefined();
    expect(tripPhoto(generatedTripFixture, "afterEssentials")).toBeDefined();
  });
});
