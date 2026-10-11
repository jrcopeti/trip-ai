import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import SavedTripsDisplay from "@/components/saved-trips/SavedTripsDisplay";
import { SEARCH_DEBOUNCE_MS } from "@/hooks/useSavedTrips";
import { getSavedTripsPage } from "@/db/actions";
import { makeTrip, savedTripsPage, tripFixture, tripFixture2 } from "@/test/fixtures";
import { stubSrc } from "@/test/imageStub";
import { badge, empty, error, header, more } from "@/components/saved-trips/content";

vi.mock("@/db/actions", () => ({ getSavedTripsPage: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

const mockGetPage = vi.mocked(getSavedTripsPage);

/** For waits that sit behind the search debounce: the default 1s is too tight under load. */
const AFTER_DEBOUNCE = { timeout: SEARCH_DEBOUNCE_MS + 2000 };

beforeEach(() => {
  mockGetPage.mockReset();
});

describe("SavedTripsDisplay", () => {
  it("renders the page heading", () => {
    mockGetPage.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<SavedTripsDisplay />);

    expect(
      screen.getByRole("heading", { level: 1, name: new RegExp(header.heading.claim) }),
    ).toBeInTheDocument();
  });

  it("turns a decorative sticker in the header, hidden from assistive tech", () => {
    mockGetPage.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<SavedTripsDisplay />);

    const ring = screen.getAllByText(new RegExp(badge.label), { exact: false })[0];
    expect(ring.closest("[aria-hidden]")).not.toBeNull();
  });

  it("shows a loading status while the query is pending", () => {
    mockGetPage.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<SavedTripsDisplay />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders one polaroid per trip, as a list", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
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
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<SavedTripsDisplay />);

    expect((await screen.findByRole("link", { name: /lisbon/i })).className).toContain(
      "sm:-rotate-2",
    );
    expect(screen.getByRole("link", { name: /kyoto/i }).className).toContain(
      "sm:rotate-1",
    );
  });

  it("captions each polaroid with city and country, with the traveller beneath", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture]));
    renderWithProviders(<SavedTripsDisplay />);

    expect(
      await screen.findByRole("heading", { name: "lisbon, Portugal" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ana")).toBeInTheDocument();
  });

  it("trims stray whitespace from the city", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([makeTrip({ city: " lisbon " })]));
    renderWithProviders(<SavedTripsDisplay />);

    expect(
      await screen.findByRole("heading", { name: "lisbon, Portugal" }),
    ).toBeInTheDocument();
  });

  it("falls back to a bundled photo when a trip has none", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([makeTrip({ image: null })]));
    renderWithProviders(<SavedTripsDisplay />);

    const link = await screen.findByRole("link", { name: /lisbon/i });
    expect(link.querySelector("img")).toHaveAttribute("src", stubSrc("1.jpg"));
  });

  it("never leaves a card at opacity-0", async () => {
    // The old card carried `opacity-0` for a GSAP batch to clear. With GSAP gone,
    // that class would leave every card in the grid invisible.
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<SavedTripsDisplay />);

    const list = await screen.findByRole("list");
    expect(list.innerHTML).not.toMatch(/\bopacity-0\b/);
  });

  it("offers more trips when there are more than one page", async () => {
    const user = userEvent.setup();
    mockGetPage
      .mockResolvedValueOnce(savedTripsPage([tripFixture], 2))
      .mockResolvedValueOnce(savedTripsPage([tripFixture2], 2));
    renderWithProviders(<SavedTripsDisplay />);

    const button = await screen.findByRole("button", { name: more.button });
    expect(screen.getByText(more.count(1, 2))).toBeInTheDocument();

    await user.click(button);

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(mockGetPage).toHaveBeenLastCalledWith("", 1);
    expect(screen.getByText(more.count(2, 2))).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: more.button })).not.toBeInTheDocument();
  });

  it("shows the count but no button once every trip is on screen", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<SavedTripsDisplay />);

    expect(await screen.findByText(more.count(2, 2))).toHaveAttribute("aria-live", "polite");
    expect(screen.queryByRole("button", { name: more.button })).not.toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([]));
    renderWithProviders(<SavedTripsDisplay />);

    expect(await screen.findByRole("heading", { name: empty.heading })).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("queries with what is typed in the search", async () => {
    const user = userEvent.setup();
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<SavedTripsDisplay />);

    await user.type(screen.getByRole("searchbox", { name: header.search.label }), "kyoto");

    await waitFor(() => {
      expect(mockGetPage).toHaveBeenLastCalledWith("kyoto", 0);
    }, AFTER_DEBOUNCE);
    expect(screen.getByRole("searchbox")).toHaveValue("kyoto");
  });

  it("keeps the grid up, marked busy, while a search loads", async () => {
    const user = userEvent.setup();
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<SavedTripsDisplay />);
    expect(await screen.findAllByRole("listitem")).toHaveLength(2);

    mockGetPage.mockReturnValue(new Promise(() => {}));
    await user.type(screen.getByRole("searchbox"), "kyoto");

    await waitFor(() => {
      expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true");
    }, AFTER_DEBOUNCE);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("scrolls the search up to reveal the results when typing below the fold", async () => {
    const user = userEvent.setup();
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<SavedTripsDisplay />);
    const search = screen.getByRole("searchbox");
    vi.spyOn(search, "getBoundingClientRect").mockReturnValue({ top: 440 } as DOMRect);
    const scroll = vi.spyOn(search, "scrollIntoView");

    await user.type(search, "k");

    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ block: "start" }));
  });

  it("leaves the page alone once the search is already near the top", async () => {
    const user = userEvent.setup();
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<SavedTripsDisplay />);
    const search = screen.getByRole("searchbox");
    vi.spyOn(search, "getBoundingClientRect").mockReturnValue({ top: 96 } as DOMRect);
    const scroll = vi.spyOn(search, "scrollIntoView");

    await user.type(search, "kyoto");

    expect(scroll).not.toHaveBeenCalled();
  });

  it("offers a clear button only once there is something to clear", async () => {
    const user = userEvent.setup();
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<SavedTripsDisplay />);

    expect(screen.queryByRole("button", { name: header.search.clear })).not.toBeInTheDocument();

    await user.type(screen.getByRole("searchbox"), "kyoto");

    expect(screen.getByRole("button", { name: header.search.clear })).toBeInTheDocument();
  });

  it("clearing empties the search and returns focus to it", async () => {
    const user = userEvent.setup();
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture, tripFixture2]));
    renderWithProviders(<SavedTripsDisplay />);
    const search = screen.getByRole("searchbox");
    await user.type(search, "kyoto");

    await user.click(screen.getByRole("button", { name: header.search.clear }));

    expect(search).toHaveValue("");
    expect(search).toHaveFocus();
    expect(screen.queryByRole("button", { name: header.search.clear })).not.toBeInTheDocument();
  });

  it("gives its buttons a pointer cursor", async () => {
    mockGetPage.mockResolvedValue(savedTripsPage([tripFixture], 2));
    renderWithProviders(<SavedTripsDisplay />);

    expect((await screen.findByRole("button", { name: more.button })).className).toContain(
      "cursor-pointer",
    );
  });

  it("renders the error panel when the query fails", async () => {
    mockGetPage.mockRejectedValue(new Error("db down"));
    renderWithProviders(<SavedTripsDisplay />);

    expect(await screen.findByRole("heading", { name: error.message })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: error.button })).toHaveAttribute(
      "href",
      error.path,
    );
  });
});
