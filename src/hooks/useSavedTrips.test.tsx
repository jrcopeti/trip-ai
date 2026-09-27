import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderWithProviders, waitFor } from "@/test/render";
import { useSavedTrips } from "@/hooks/useSavedTrips";
import { getAllTrips } from "@/db/actions";
import { tripFixture, tripFixture2 } from "@/test/fixtures";

vi.mock("@/db/actions", () => ({ getAllTrips: vi.fn() }));

const mockGetAll = vi.mocked(getAllTrips);

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
    });
    await waitFor(() => {
      expect(hook.savedTrips).toHaveLength(1);
    });
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
