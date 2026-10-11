import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import SavedTripsDisplay from "@/components/saved-trips/SavedTripsDisplay";
import { getAllTrips } from "@/db/actions";
import { tripFixture, tripFixture2 } from "@/test/fixtures";
import { empty, error, header } from "@/components/saved-trips/content";

vi.mock("@/db/actions", () => ({ getAllTrips: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

const mockGetAll = vi.mocked(getAllTrips);

beforeEach(() => {
  mockGetAll.mockReset();
});

describe("SavedTripsDisplay", () => {
  it("renders the page heading", () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<SavedTripsDisplay />);

    expect(
      screen.getByRole("heading", { level: 1, name: new RegExp(header.heading.claim) }),
    ).toBeInTheDocument();
  });

  it("shows a loading status while the query is pending", () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<SavedTripsDisplay />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders one polaroid per trip, as a list", async () => {
    mockGetAll.mockResolvedValue([tripFixture, tripFixture2]);
    renderWithProviders(<SavedTripsDisplay />);

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /lisbon/i })).toHaveAttribute(
      "href",
      "/saved-trips/1",
    );
    expect(screen.getByRole("link", { name: /kyoto/i })).toHaveAttribute(
      "href",
      "/saved-trips/2",
    );
  });

  it("fans the cards by their position in the grid", async () => {
    mockGetAll.mockResolvedValue([tripFixture, tripFixture2]);
    renderWithProviders(<SavedTripsDisplay />);

    expect((await screen.findByRole("link", { name: /lisbon/i })).className).toContain(
      "sm:-rotate-2",
    );
    expect(screen.getByRole("link", { name: /kyoto/i }).className).toContain(
      "sm:rotate-1",
    );
  });

  it("shows the empty state when nothing matches", async () => {
    mockGetAll.mockResolvedValue([]);
    renderWithProviders(<SavedTripsDisplay />);

    expect(await screen.findByRole("heading", { name: empty.heading })).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("queries with what is typed in the search", async () => {
    const user = userEvent.setup();
    mockGetAll.mockResolvedValue([tripFixture, tripFixture2]);
    renderWithProviders(<SavedTripsDisplay />);

    await user.type(screen.getByRole("searchbox", { name: header.search.label }), "kyoto");

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenLastCalledWith("kyoto");
    });
    expect(screen.getByRole("searchbox")).toHaveValue("kyoto");
  });

  it("renders the error panel when the query fails", async () => {
    mockGetAll.mockRejectedValue(new Error("db down"));
    renderWithProviders(<SavedTripsDisplay />);

    expect(await screen.findByRole("heading", { name: error.message })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: error.button })).toHaveAttribute(
      "href",
      error.path,
    );
  });
});
