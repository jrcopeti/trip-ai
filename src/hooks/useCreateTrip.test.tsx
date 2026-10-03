import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, waitFor } from "@/test/render";
import { useCreateTrip } from "@/hooks/useCreateTrip";
import { createTripInDB } from "@/db/actions";
import {
  finalFormData,
  imageDataFixture,
  tripDataFixture,
  tripFixture,
} from "@/test/fixtures";

vi.mock("@/db/actions", () => ({ createTripInDB: vi.fn() }));

const setIsTripSaved = vi.fn();

vi.mock("@/hooks/useFormData", () => ({
  useFormData: () => ({ formData: finalFormData }),
}));
vi.mock("@/hooks/useTripResponse", () => ({
  useTripResponse: () => ({ tripData: tripDataFixture, setIsTripSaved }),
}));
vi.mock("@/hooks/useImage", () => ({
  useImage: () => ({ imageData: imageDataFixture }),
}));

const mockCreate = vi.mocked(createTripInDB);

let hook: ReturnType<typeof useCreateTrip>;

function Probe({ tripUrl }: { tripUrl?: string }) {
  hook = useCreateTrip({ tripUrl });
  return null;
}

function renderHook(tripUrl: string | undefined = "ab12c") {
  return renderWithProviders(<Probe tripUrl={tripUrl} />);
}

/** The single argument `createTripInDB` was called with. */
function payload() {
  return mockCreate.mock.calls[0][0];
}

beforeEach(() => {
  mockCreate.mockReset();
  mockCreate.mockResolvedValue(tripFixture);
  setIsTripSaved.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("useCreateTrip — handleYesAnswer", () => {
  it("writes the trip flagged as saved", async () => {
    renderHook();
    hook.handleYesAnswer();

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
    expect(payload()).toMatchObject({ saved: true });
  });

  it("merges the AI response into the payload", async () => {
    renderHook();
    hook.handleYesAnswer();

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    expect(payload()).toMatchObject({
      title: tripDataFixture.title,
      description: tripDataFixture.description,
      tip: tripDataFixture.tip,
      tours: tripDataFixture.tours,
      mustHave: tripDataFixture.mustHave,
    });
  });

  it("merges the form data into the payload", async () => {
    renderHook();
    hook.handleYesAnswer();

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    expect(payload()).toMatchObject({
      userName: "ana",
      city: "lisbon",
      country: "Portugal",
      interests: ["art", "food"],
      budget: "comfort",
      agreement: true,
    });
  });

  it("converts the date strings to Date objects for Prisma", async () => {
    renderHook();
    hook.handleYesAnswer();

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    const data = payload();
    expect(data.startDate).toBeInstanceOf(Date);
    expect(data.endDate).toBeInstanceOf(Date);
    expect((data.startDate as Date).toISOString()).toBe(finalFormData.startDate);
  });

  it("attaches all five images and the blur placeholder", async () => {
    renderHook();
    hook.handleYesAnswer();

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    expect(payload()).toMatchObject({
      image: imageDataFixture.tripImage,
      image2: imageDataFixture.tripImage2,
      image3: imageDataFixture.tripImage3,
      image4: imageDataFixture.tripImage4,
      image5: imageDataFixture.tripImage5,
      placeholder: imageDataFixture.placeholder,
    });
  });

  it("carries the trip url from the route params", async () => {
    renderHook("zz99y");
    hook.handleYesAnswer();

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    expect(payload()).toMatchObject({ tripUrl: "zz99y" });
  });

  it("marks the trip saved in context once the write succeeds", async () => {
    renderHook();
    hook.handleYesAnswer();

    await waitFor(() => {
      expect(setIsTripSaved).toHaveBeenCalledWith(true);
    });
  });
});

describe("useCreateTrip — handleNoAnswer", () => {
  it("still writes the trip, flagged unsaved", async () => {
    renderHook();
    hook.handleNoAnswer();

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
    expect(payload()).toMatchObject({ saved: false });
  });

  it("attaches the images but no blur placeholder", async () => {
    // Deliberate, not an oversight: a discarded trip is written to the DB but
    // never read back — both getAllTrips and getSingleSavedTrip filter on
    // saved: true — so nothing ever renders its blur placeholder.
    renderHook();
    hook.handleNoAnswer();

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    const data = payload();
    expect(data.image).toBe(imageDataFixture.tripImage);
    expect(data.placeholder).toBeUndefined();
  });

  it("marks the answer handled in context", async () => {
    renderHook();
    hook.handleNoAnswer();

    await waitFor(() => {
      expect(setIsTripSaved).toHaveBeenCalledWith(true);
    });
  });
});

describe("useCreateTrip — failure", () => {
  it("surfaces the error and does not mark the trip saved", async () => {
    mockCreate.mockRejectedValue(new Error("connection refused"));
    renderHook();
    hook.handleYesAnswer();

    await waitFor(() => {
      expect(hook.createTripError).toBeInstanceOf(Error);
    });
    expect(setIsTripSaved).not.toHaveBeenCalled();
  });

  it("reports pending while the write is in flight", async () => {
    let resolve: (value: typeof tripFixture) => void = () => {};
    mockCreate.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    renderHook();
    hook.handleYesAnswer();

    await waitFor(() => {
      expect(hook.isCreatingTrip).toBe(true);
    });

    resolve(tripFixture);
    await waitFor(() => {
      expect(hook.isCreatingTrip).toBe(false);
    });
  });
});
