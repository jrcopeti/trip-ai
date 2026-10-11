import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderWithProviders, waitFor } from "@/test/render";
import { SEARCH_DEBOUNCE_MS, useSavedTrips } from "@/hooks/useSavedTrips";
import { getAllTrips } from "@/db/actions";
import { tripFixture, tripFixture2 } from "@/test/fixtures";

vi.mock("@/db/actions", () => ({ getAllTrips: vi.fn() }));

const mockGetAll = vi.mocked(getAllTrips);

/** For waits that sit behind the search debounce: the default 1s is too tight under load. */
const AFTER_DEBOUNCE = { timeout: SEARCH_DEBOUNCE_MS + 2000 };

let hook: ReturnType<typeof useSavedTrips>;

function Probe() {
  hook = useSavedTrips();
  return null;
}

beforeEach(() => {
  mockGetAll.mockReset();
});

describe("useSavedTrips", () => {
  it("fetches with an empty search term on mount", async () => {
    mockGetAll.mockResolvedValue([tripFixture, tripFixture2]);
    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(hook.savedTrips).toHaveLength(2);
    });
    expect(mockGetAll).toHaveBeenCalledWith("");
  });

  it("reports pending before the first result", () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Probe />);

    expect(hook.isPendingSavedTrips).toBe(true);
    expect(hook.savedTrips).toBeUndefined();
  });

  it("refetches when the search term changes", async () => {
    mockGetAll.mockResolvedValue([tripFixture, tripFixture2]);
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.savedTrips).toHaveLength(2));

    mockGetAll.mockResolvedValue([tripFixture]);
    act(() => {
      hook.setSearchTerm("lisbon");
    });

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenLastCalledWith("lisbon");
    }, AFTER_DEBOUNCE);
    await waitFor(() => {
      expect(hook.savedTrips).toHaveLength(1);
    }, AFTER_DEBOUNCE);
  });

  it("does not query until typing pauses", async () => {
    mockGetAll.mockResolvedValue([tripFixture, tripFixture2]);
    renderWithProviders(<Probe />);
    await waitFor(() => expect(hook.savedTrips).toHaveLength(2));

    act(() => {
      hook.setSearchTerm("lisbon");
    });

    expect(mockGetAll).not.toHaveBeenCalledWith("lisbon");
    await waitFor(() => {
      expect(mockGetAll).toHaveBeenLastCalledWith("lisbon");
    }, AFTER_DEBOUNCE);
  });

  it("queries once for a burst of keystrokes, with the last term", async () => {
    mockGetAll.mockResolvedValue([tripFixture, tripFixture2]);
    renderWithProviders(<Probe />);
    await waitFor(() => expect(hook.savedTrips).toHaveLength(2));

    for (const term of ["k", "ky", "kyo"]) {
      act(() => {
        hook.setSearchTerm(term);
      });
    }

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenLastCalledWith("kyo");
    }, AFTER_DEBOUNCE);
    expect(mockGetAll).not.toHaveBeenCalledWith("k");
    expect(mockGetAll).not.toHaveBeenCalledWith("ky");
  });

  it("keeps the previous trips on screen while a new search loads", async () => {
    mockGetAll.mockResolvedValue([tripFixture, tripFixture2]);
    renderWithProviders(<Probe />);
    await waitFor(() => expect(hook.savedTrips).toHaveLength(2));

    mockGetAll.mockReturnValue(new Promise(() => {}));
    act(() => {
      hook.setSearchTerm("lisbon");
    });

    await waitFor(() => {
      expect(hook.isSearchingSavedTrips).toBe(true);
    }, AFTER_DEBOUNCE);
    expect(hook.savedTrips).toHaveLength(2);
    expect(hook.isPendingSavedTrips).toBe(false);
  });

  it("exposes the current search term", async () => {
    mockGetAll.mockResolvedValue([]);
    renderWithProviders(<Probe />);

    expect(hook.searchTerm).toBe("");
    act(() => {
      hook.setSearchTerm("kyoto");
    });
    await waitFor(() => {
      expect(hook.searchTerm).toBe("kyoto");
    });
  });

  it("handles an empty result", async () => {
    mockGetAll.mockResolvedValue([]);
    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(hook.savedTrips).toEqual([]);
    });
    expect(hook.savedTripsError).toBeNull();
  });

  it("surfaces a fetch error", async () => {
    mockGetAll.mockRejectedValue(new Error("connection refused"));
    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(hook.savedTripsError).toBeInstanceOf(Error);
    });
    expect(hook.savedTrips).toBeUndefined();
  });
});
