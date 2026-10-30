import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderWithProviders, waitFor } from "@/test/render";
import { SEARCH_DEBOUNCE_MS, useSavedTrips } from "@/hooks/useSavedTrips";
import { getSavedTripsPage } from "@/db/actions";
import { savedTripsPage, tripFixture, tripFixture2 } from "@/test/fixtures";

vi.mock("@/db/actions", () => ({ getSavedTripsPage: vi.fn() }));

const mockGetPage = vi.mocked(getSavedTripsPage);

/** For waits that sit behind the search debounce: the default 1s is too tight under load. */
const AFTER_DEBOUNCE = { timeout: SEARCH_DEBOUNCE_MS + 2000 };

let hook: ReturnType<typeof useSavedTrips>;

function Probe() {
  hook = useSavedTrips();
  return null;
}

beforeEach(() => {
  mockGetPage.mockReset();
});

describe("useSavedTrips", () => {
  it("fetches with an empty search term on mount", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(hook.savedTrips).toHaveLength(2);
    });
    expect(mockGetPage).toHaveBeenCalledWith("", 0);
  });

  it("reports pending before the first result", () => {
    mockGetPage.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Probe />);

    expect(hook.isPendingSavedTrips).toBe(true);
    expect(hook.savedTrips).toBeUndefined();
  });

  it("refetches when the search term changes", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.savedTrips).toHaveLength(2));

    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture]));
    act(() => {
      hook.setSearchTerm("lisbon");
    });

    await waitFor(() => {
      expect(mockGetPage).toHaveBeenLastCalledWith("lisbon", 0);
    }, AFTER_DEBOUNCE);
    await waitFor(() => {
      expect(hook.savedTrips).toHaveLength(1);
    }, AFTER_DEBOUNCE);
  });

  it("does not query until typing pauses", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<Probe />);
    await waitFor(() => expect(hook.savedTrips).toHaveLength(2));

    act(() => {
      hook.setSearchTerm("lisbon");
    });

    expect(mockGetPage).not.toHaveBeenCalledWith("lisbon", expect.anything());
    await waitFor(() => {
      expect(mockGetPage).toHaveBeenLastCalledWith("lisbon", 0);
    }, AFTER_DEBOUNCE);
  });

  it("queries once for a burst of keystrokes, with the last term", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<Probe />);
    await waitFor(() => expect(hook.savedTrips).toHaveLength(2));

    for (const term of ["k", "ky", "kyo"]) {
      act(() => {
        hook.setSearchTerm(term);
      });
    }

    await waitFor(() => {
      expect(mockGetPage).toHaveBeenLastCalledWith("kyo", 0);
    }, AFTER_DEBOUNCE);
    expect(mockGetPage).not.toHaveBeenCalledWith("k", expect.anything());
    expect(mockGetPage).not.toHaveBeenCalledWith("ky", expect.anything());
  });

  it("keeps the previous trips on screen while a new search loads", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<Probe />);
    await waitFor(() => expect(hook.savedTrips).toHaveLength(2));

    mockGetPage.mockReturnValue(new Promise(() => {}));
    act(() => {
      hook.setSearchTerm("lisbon");
    });

    await waitFor(() => {
      expect(hook.isSearchingSavedTrips).toBe(true);
    }, AFTER_DEBOUNCE);
    expect(hook.savedTrips).toHaveLength(2);
    expect(hook.isPendingSavedTrips).toBe(false);
  });

  it("has more to load while the total exceeds what is loaded", async () => {
    mockGetPage
      .mockResolvedValueOnce(savedTripsPage([tripFixture], 2))
      .mockResolvedValueOnce(savedTripsPage([tripFixture2], 2));
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.hasMoreSavedTrips).toBe(true));
    expect(hook.totalSavedTrips).toBe(2);

    await act(async () => {
      await hook.loadMoreSavedTrips();
    });

    expect(mockGetPage).toHaveBeenLastCalledWith("", 1);
    await waitFor(() => {
      expect(hook.savedTrips).toEqual([tripFixture, tripFixture2]);
    });
    expect(hook.hasMoreSavedTrips).toBe(false);
  });

  it("has nothing more to load when the first page is everything", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.savedTrips).toHaveLength(2));
    expect(hook.hasMoreSavedTrips).toBe(false);
  });

  it("starts a new search from the first page", async () => {
    mockGetPage
      .mockResolvedValueOnce(savedTripsPage([tripFixture], 2))
      .mockResolvedValueOnce(savedTripsPage([tripFixture2], 2))
      .mockResolvedValue(savedTripsPage([tripFixture]));
    renderWithProviders(<Probe />);
    await waitFor(() => expect(hook.hasMoreSavedTrips).toBe(true));
    await act(async () => {
      await hook.loadMoreSavedTrips();
    });

    act(() => {
      hook.setSearchTerm("lisbon");
    });

    await waitFor(() => {
      expect(mockGetPage).toHaveBeenLastCalledWith("lisbon", 0);
    }, AFTER_DEBOUNCE);
    await waitFor(() => expect(hook.savedTrips).toEqual([tripFixture]));
  });

  it("drops a trip a later page repeats", async () => {
    // A trip saved between two pages shifts every row down one, so the last
    // trip of page 0 comes back first on page 1.
    mockGetPage
      .mockResolvedValueOnce(savedTripsPage([tripFixture], 3))
      .mockResolvedValueOnce(savedTripsPage([tripFixture, tripFixture2], 3));
    renderWithProviders(<Probe />);
    await waitFor(() => expect(hook.hasMoreSavedTrips).toBe(true));

    await act(async () => {
      await hook.loadMoreSavedTrips();
    });

    await waitFor(() => {
      expect(hook.savedTrips?.map((trip) => trip.id)).toEqual([1, 2]);
    });
    // Two distinct trips of three: the repeat is not counted as loaded.
    expect(hook.hasMoreSavedTrips).toBe(true);
  });

  it("stops at an empty page, though the total was not reached", async () => {
    // The trip saved mid-browse sits on page 0, already loaded, so the
    // offsets run out one short of the total.
    mockGetPage
      .mockResolvedValueOnce(savedTripsPage([tripFixture], 3))
      .mockResolvedValueOnce(savedTripsPage([tripFixture, tripFixture2], 3))
      .mockResolvedValueOnce(savedTripsPage([], 3));
    renderWithProviders(<Probe />);
    await waitFor(() => expect(hook.hasMoreSavedTrips).toBe(true));

    await act(async () => {
      await hook.loadMoreSavedTrips();
    });
    await waitFor(() => expect(hook.hasMoreSavedTrips).toBe(true));
    await act(async () => {
      await hook.loadMoreSavedTrips();
    });

    expect(mockGetPage).toHaveBeenLastCalledWith("", 2);
    await waitFor(() => expect(hook.hasMoreSavedTrips).toBe(false));
    expect(hook.savedTrips?.map((trip) => trip.id)).toEqual([1, 2]);
  });

  it("keeps the loaded trips when loading more fails", async () => {
    mockGetPage
      .mockResolvedValueOnce(savedTripsPage([tripFixture], 2))
      .mockRejectedValueOnce(new Error("timeout"));
    renderWithProviders(<Probe />);
    await waitFor(() => expect(hook.hasMoreSavedTrips).toBe(true));

    await act(async () => {
      await hook.loadMoreSavedTrips();
    });

    await waitFor(() => expect(hook.loadMoreFailed).toBe(true));
    expect(hook.savedTrips).toEqual([tripFixture]);
    expect(hook.savedTripsError).toBeNull();
  });

  it("exposes the current search term", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([]));
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
    mockGetPage.mockResolvedValue(savedTripsPage([]));
    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(hook.savedTrips).toEqual([]);
    });
    expect(hook.savedTripsError).toBeNull();
  });

  it("surfaces a fetch error", async () => {
    mockGetPage.mockRejectedValue(new Error("connection refused"));
    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(hook.savedTripsError).toBeInstanceOf(Error);
    });
    expect(hook.savedTrips).toBeUndefined();
  });
});
