import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, waitFor } from "@/test/render";
import { useSaveTrip } from "@/hooks/useSaveTrip";
import { setTripSaved } from "@/db/actions";
import { generatedTripFixture } from "@/test/fixtures";
import { refresh, resetNextStubs } from "@/test/stubs/next";
import { readOpenTrip, rememberOpenTrip } from "@/lib/openTrip";

vi.mock("@/db/actions", () => ({ setTripSaved: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/stubs/next"));

const mockSave = vi.mocked(setTripSaved);
const { tripUrl } = generatedTripFixture;

let hook: ReturnType<typeof useSaveTrip>;

function Probe() {
  hook = useSaveTrip(tripUrl);
  return null;
}

beforeEach(() => {
  resetNextStubs();
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
    // So the router cache's copy of the page, rendered unsaved, is replaced.
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("answers no with the flag false, and marks the answer handled", async () => {
    renderWithProviders(<Probe />);
    hook.handleNoAnswer();

    await waitFor(() => expect(mockSave).toHaveBeenCalledWith(tripUrl, false));
    await waitFor(() => expect(hook.isAnswered).toBe(true));
  });

  it.each([
    ["yes", () => hook.handleYesAnswer()],
    ["no", () => hook.handleNoAnswer()],
  ])("frees this browser to plan another trip once %s is written", async (_, answer) => {
    rememberOpenTrip(tripUrl);
    renderWithProviders(<Probe />);
    answer();

    await waitFor(() => expect(hook.isAnswered).toBe(true));
    expect(readOpenTrip()).toBeNull();
  });

  it("surfaces a failed write and leaves the question open", async () => {
    mockSave.mockRejectedValue(new Error("No unsaved trip at that url"));
    rememberOpenTrip(tripUrl);
    renderWithProviders(<Probe />);
    hook.handleYesAnswer();

    await waitFor(() => expect(hook.saveTripError).toBeInstanceOf(Error));
    expect(hook.isAnswered).toBe(false);
    expect(readOpenTrip()).toBe(tripUrl);
    expect(refresh).not.toHaveBeenCalled();
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
