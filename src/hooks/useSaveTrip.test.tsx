import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, waitFor } from "@/test/render";
import { useSaveTrip } from "@/hooks/useSaveTrip";
import { setTripSaved } from "@/db/actions";
import { generatedTripFixture } from "@/test/fixtures";
import type { Trip } from "@prisma/client";

vi.mock("@/db/actions", () => ({ setTripSaved: vi.fn() }));

const setIsTripSaved = vi.fn();
let tripData: Trip | null = generatedTripFixture;

vi.mock("@/hooks/useTripResponse", () => ({
  useTripResponse: () => ({ tripData, setIsTripSaved }),
}));

const mockSave = vi.mocked(setTripSaved);

let hook: ReturnType<typeof useSaveTrip>;

function Probe() {
  hook = useSaveTrip();
  return null;
}

beforeEach(() => {
  tripData = generatedTripFixture;
  mockSave.mockReset();
  mockSave.mockResolvedValue(undefined);
  setIsTripSaved.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("useSaveTrip", () => {
  it("saves the generated trip by its url, sending nothing else", async () => {
    renderWithProviders(<Probe />);
    hook.handleYesAnswer();

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave).toHaveBeenCalledWith(generatedTripFixture.tripUrl, true);
    await waitFor(() => expect(setIsTripSaved).toHaveBeenCalledWith(true));
  });

  it("answers no with the flag false, and marks the answer handled", async () => {
    renderWithProviders(<Probe />);
    hook.handleNoAnswer();

    await waitFor(() => expect(mockSave).toHaveBeenCalledWith(generatedTripFixture.tripUrl, false));
    await waitFor(() => expect(setIsTripSaved).toHaveBeenCalledWith(true));
  });

  it("surfaces a failed write and leaves the question open", async () => {
    mockSave.mockRejectedValue(new Error("No unsaved trip at that url"));
    renderWithProviders(<Probe />);
    hook.handleYesAnswer();

    await waitFor(() => expect(hook.saveTripError).toBeInstanceOf(Error));
    expect(setIsTripSaved).not.toHaveBeenCalled();
  });

  it("fails without a call when there is no trip in hand", async () => {
    tripData = null;
    renderWithProviders(<Probe />);
    hook.handleYesAnswer();

    await waitFor(() => expect(hook.saveTripError).toBeInstanceOf(Error));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it("reports pending while the write is in flight", async () => {
    let resolve: () => void = () => {};
    mockSave.mockReturnValue(new Promise<void>((r) => (resolve = r)));
    renderWithProviders(<Probe />);
    hook.handleYesAnswer();

    await waitFor(() => expect(hook.isSavingTrip).toBe(true));
    resolve();
    await waitFor(() => expect(hook.isSavingTrip).toBe(false));
  });
});
