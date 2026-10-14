import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, waitFor } from "@/test/render";
import { useSaveTrip } from "@/hooks/useSaveTrip";
import { setTripSaved } from "@/db/actions";
import { generatedTripFixture } from "@/test/fixtures";

vi.mock("@/db/actions", () => ({ setTripSaved: vi.fn() }));

const mockSave = vi.mocked(setTripSaved);
const { tripUrl } = generatedTripFixture;

let hook: ReturnType<typeof useSaveTrip>;

function Probe() {
  hook = useSaveTrip(tripUrl);
  return null;
}

beforeEach(() => {
  mockSave.mockReset();
  mockSave.mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("useSaveTrip", () => {
  it("saves the trip by its url, sending nothing else", async () => {
    renderWithProviders(<Probe />);
    expect(hook.isAnswered).toBe(false);
    hook.handleYesAnswer();

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave).toHaveBeenCalledWith(tripUrl, true);
    await waitFor(() => expect(hook.isAnswered).toBe(true));
  });

  it("answers no with the flag false, and marks the answer handled", async () => {
    renderWithProviders(<Probe />);
    hook.handleNoAnswer();

    await waitFor(() => expect(mockSave).toHaveBeenCalledWith(tripUrl, false));
    await waitFor(() => expect(hook.isAnswered).toBe(true));
  });

  it("surfaces a failed write and leaves the question open", async () => {
    mockSave.mockRejectedValue(new Error("No unsaved trip at that url"));
    renderWithProviders(<Probe />);
    hook.handleYesAnswer();

    await waitFor(() => expect(hook.saveTripError).toBeInstanceOf(Error));
    expect(hook.isAnswered).toBe(false);
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
