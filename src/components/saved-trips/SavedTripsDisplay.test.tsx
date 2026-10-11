import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import SavedTripsDisplay from "@/components/saved-trips/SavedTripsDisplay";
import { SEARCH_DEBOUNCE_MS } from "@/hooks/useSavedTrips";
import { getAllTrips } from "@/db/actions";
import { makeTrip, tripFixture, tripFixture2 } from "@/test/fixtures";
import { stubSrc } from "@/test/imageStub";
import { badge, empty, error, header } from "@/components/saved-trips/content";

vi.mock("@/db/actions", () => ({ getAllTrips: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

const mockGetAll = vi.mocked(getAllTrips);

/** For waits that sit behind the search debounce: the default 1s is too tight under load. */
const AFTER_DEBOUNCE = { timeout: SEARCH_DEBOUNCE_MS + 2000 };

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

  it("turns a decorative sticker in the header, hidden from assistive tech", () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<SavedTripsDisplay />);

    const ring = screen.getAllByText(new RegExp(badge.label), { exact: false })[0];
    expect(ring.closest("[aria-hidden]")).not.toBeNull();
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

  it("captions each polaroid with city and country, with the traveller beneath", async () => {
    mockGetAll.mockResolvedValue([tripFixture]);
    renderWithProviders(<SavedTripsDisplay />);

    expect(
      await screen.findByRole("heading", { name: "lisbon, Portugal" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ana")).toBeInTheDocument();
  });

  it("trims stray whitespace from the city", async () => {
    mockGetAll.mockResolvedValue([makeTrip({ city: " lisbon " })]);
    renderWithProviders(<SavedTripsDisplay />);

    expect(
      await screen.findByRole("heading", { name: "lisbon, Portugal" }),
    ).toBeInTheDocument();
  });

  it("falls back to a bundled photo when a trip has none", async () => {
    mockGetAll.mockResolvedValue([makeTrip({ image: null })]);
    renderWithProviders(<SavedTripsDisplay />);

    const link = await screen.findByRole("link", { name: /lisbon/i });
    expect(link.querySelector("img")).toHaveAttribute("src", stubSrc("1.jpg"));
  });

  it("never leaves a card at opacity-0", async () => {
    // The old card carried `opacity-0` for a GSAP batch to clear. With GSAP gone,
    // that class would leave every card in the grid invisible.
    mockGetAll.mockResolvedValue([tripFixture, tripFixture2]);
    renderWithProviders(<SavedTripsDisplay />);

    const list = await screen.findByRole("list");
    expect(list.innerHTML).not.toMatch(/\bopacity-0\b/);
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
    }, AFTER_DEBOUNCE);
    expect(screen.getByRole("searchbox")).toHaveValue("kyoto");
  });

  it("keeps the grid up, marked busy, while a search loads", async () => {
    const user = userEvent.setup();
    mockGetAll.mockResolvedValue([tripFixture, tripFixture2]);
    renderWithProviders(<SavedTripsDisplay />);
    expect(await screen.findAllByRole("listitem")).toHaveLength(2);

    mockGetAll.mockReturnValue(new Promise(() => {}));
    await user.type(screen.getByRole("searchbox"), "kyoto");

    await waitFor(() => {
      expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true");
    }, AFTER_DEBOUNCE);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("scrolls the search up to reveal the results when typing below the fold", async () => {
    const user = userEvent.setup();
    mockGetAll.mockResolvedValue([tripFixture, tripFixture2]);
    renderWithProviders(<SavedTripsDisplay />);
    const search = screen.getByRole("searchbox");
    vi.spyOn(search, "getBoundingClientRect").mockReturnValue({ top: 440 } as DOMRect);
    const scroll = vi.spyOn(search, "scrollIntoView");

    await user.type(search, "k");

    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ block: "start" }));
  });

  it("leaves the page alone once the search is already near the top", async () => {
    const user = userEvent.setup();
    mockGetAll.mockResolvedValue([tripFixture, tripFixture2]);
    renderWithProviders(<SavedTripsDisplay />);
    const search = screen.getByRole("searchbox");
    vi.spyOn(search, "getBoundingClientRect").mockReturnValue({ top: 96 } as DOMRect);
    const scroll = vi.spyOn(search, "scrollIntoView");

    await user.type(search, "kyoto");

    expect(scroll).not.toHaveBeenCalled();
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
