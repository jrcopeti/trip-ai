import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, waitFor } from "@/test/render";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { getSingleSavedTrip } from "@/db/actions";
import { tripFixture } from "@/test/fixtures";
import type { Params } from "@/types";

vi.mock("@/db/actions", () => ({ getSingleSavedTrip: vi.fn() }));

const mockGetOne = vi.mocked(getSingleSavedTrip);

let hook: ReturnType<typeof useSingleSavedTrip>;

function Probe({ params }: { params: Params }) {
  hook = useSingleSavedTrip({ params });
  return null;
}

beforeEach(() => {
  mockGetOne.mockReset();
});

describe("useSingleSavedTrip", () => {
  it("fetches the trip for a numeric id", async () => {
    mockGetOne.mockResolvedValue(tripFixture);
    renderWithProviders(<Probe params={{ id: 1 }} />);

    await waitFor(() => {
      expect(hook.trip).toEqual(tripFixture);
    });
    expect(mockGetOne).toHaveBeenCalledWith(1);
  });

  it("coerces a string route param to a number", async () => {
    mockGetOne.mockResolvedValue(tripFixture);
    renderWithProviders(<Probe params={{ id: "1" }} />);

    await waitFor(() => {
      expect(mockGetOne).toHaveBeenCalledWith(1);
    });
  });

  it("does not fetch without an id", () => {
    renderWithProviders(<Probe params={{}} />);

    expect(mockGetOne).not.toHaveBeenCalled();
    expect(hook.trip).toBeUndefined();
  });

  it("returns null for a trip that is not there", async () => {
    mockGetOne.mockResolvedValue(null);
    renderWithProviders(<Probe params={{ id: 999 }} />);

    await waitFor(() => {
      expect(hook.trip).toBeNull();
    });
    expect(hook.errorSingleSavedTrip).toBeNull();
  });

  it("surfaces a fetch error", async () => {
    mockGetOne.mockRejectedValue(new Error("connection refused"));
    renderWithProviders(<Probe params={{ id: 1 }} />);

    await waitFor(() => {
      expect(hook.errorSingleSavedTrip).toBeInstanceOf(Error);
    });
  });

  it("reports pending before the first result", () => {
    mockGetOne.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Probe params={{ id: 1 }} />);

    expect(hook.isPendingSingleSavedTrip).toBe(true);
  });
});
