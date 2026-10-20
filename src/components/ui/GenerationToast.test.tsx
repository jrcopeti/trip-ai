import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { useIsMutating } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import GenerationToast from "@/components/ui/GenerationToast";
import { GENERATION_TOAST } from "@/components/ui/GenerationToasts";
import { generateTripKey, useTripGeneration } from "@/hooks/useTripGeneration";
import { generateTrip } from "@/app/api/anthropicApi";
import { generatedTripFixture, validTripRequest } from "@/test/fixtures";
import { replace, resetNextStubs, routerState } from "@/test/stubs/next";

vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));

const mockGenerate = vi.mocked(generateTrip);

let start: () => void;

// Stands in for the form: starts the generation, and reports pending as `Form` reads it.
function Starter() {
  const { generateTrip } = useTripGeneration();
  start = () => generateTrip(validTripRequest);
  const pending = useIsMutating({ mutationKey: generateTripKey }) > 0;
  return <span data-testid="pending">{String(pending)}</span>;
}

/** Renders the toast where the traveller is, both for the router and the live location. */
function renderAt(path: string) {
  routerState.pathname = path;
  window.history.replaceState(null, "", path);
  return renderWithProviders(
    <>
      <Toaster />
      <GenerationToast />
      <Starter />
    </>,
  );
}

let settle: (trip: typeof generatedTripFixture) => void;

beforeEach(() => {
  resetNextStubs();
  mockGenerate.mockReset();
  mockGenerate.mockReturnValue(
    new Promise((resolve) => {
      settle = resolve;
    }),
  );
});

afterEach(() => {
  toast.remove();
  window.history.replaceState(null, "", "/");
});

describe("GenerationToast", () => {
  it("says a trip is being planned while one is pending off /form", async () => {
    renderAt("/about");

    start();

    expect(await screen.findByRole("status")).toHaveTextContent("Your trip is being planned");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    // Back to /form, where the loader shows the generation.
    expect(screen.getByRole("link", { name: "View" })).toHaveAttribute("href", "/form");
  });

  it("shows nothing on /form, where the loader says it", async () => {
    renderAt("/form");

    start();

    await waitFor(() => expect(screen.getByTestId("pending")).toHaveTextContent("true"));
    expect(screen.queryByText("Your trip is being planned")).toBeNull();
  });

  // It fades out over 1s; under the loader its Cancel must take no click or key meanwhile.
  it("goes inert at once when the traveller returns to /form", async () => {
    const { rerender } = renderAt("/about");
    start();
    await screen.findByText("Your trip is being planned");

    routerState.pathname = "/form";
    window.history.replaceState(null, "", "/form");
    rerender(
      <>
        <Toaster />
        <GenerationToast />
        <Starter />
      </>,
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cancel" }).closest("[inert]")).not.toBeNull(),
    );
    expect(screen.getByTestId("pending")).toHaveTextContent("true");
  });

  // Removing it under the cursor would leave the Toaster paused, so later toasts never leave.
  it("is dismissed, not removed, on /form", async () => {
    const remove = vi.spyOn(toast, "remove");
    const dismiss = vi.spyOn(toast, "dismiss");
    const { rerender } = renderAt("/about");
    start();
    await screen.findByText("Your trip is being planned");

    routerState.pathname = "/form";
    window.history.replaceState(null, "", "/form");
    rerender(
      <>
        <Toaster />
        <GenerationToast />
        <Starter />
      </>,
    );

    await waitFor(() => expect(dismiss).toHaveBeenCalledWith(GENERATION_TOAST));
    expect(remove).not.toHaveBeenCalledWith(GENERATION_TOAST);
  });

  it("becomes the way to the trip when it lands, without moving the traveller", async () => {
    renderAt("/saved-trips");
    start();
    await screen.findByText("Your trip is being planned");

    settle(generatedTripFixture);

    await screen.findByText("Your trip has been generated!");
    const view = screen.getByRole("link", { name: "View" });
    expect(view).toHaveAttribute("href", `/trips/${generatedTripFixture.tripUrl}`);
    expect(screen.queryByText("Your trip is being planned")).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it("stops by keyboard: it says so, and nothing shows when the trip lands", async () => {
    const user = userEvent.setup();
    renderAt("/about");
    start();
    await screen.findByText("Your trip is being planned");

    await user.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.keyboard("{Enter}");

    await waitFor(() => expect(screen.getByTestId("pending")).toHaveTextContent("false"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Your trip was cancelled");
    expect(screen.queryByText("Your trip is being planned")).toBeNull();

    settle(generatedTripFixture);
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText("Your trip has been generated!")).toBeNull();
    expect(screen.queryByRole("link", { name: "View" })).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  // Nothing else links to an unanswered trip, so the toast has no Dismiss to lose it by.
  it("offers only View, no Dismiss", async () => {
    renderAt("/about");
    start();
    await screen.findByText("Your trip is being planned");

    settle(generatedTripFixture);

    await screen.findByText("Your trip has been generated!");
    expect(screen.getByRole("link", { name: "View" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
  });

  // On that trip's page its job is done; with no Dismiss it would otherwise stay for good.
  it("closes itself on the trip's own page", async () => {
    renderAt(`/trips/${generatedTripFixture.tripUrl}`);
    start();
    await screen.findByText("Your trip is being planned");

    settle(generatedTripFixture);

    await screen.findByText("Your trip has been generated!");
    await waitFor(() => expect(screen.queryByText("Your trip has been generated!")).toBeNull(), {
      timeout: 2000,
    });
  });

  it("asks before a reload while a generation is pending, and not after", async () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    renderAt("/about");
    expect(add).not.toHaveBeenCalledWith("beforeunload", expect.any(Function));

    start();
    await waitFor(() =>
      expect(add).toHaveBeenCalledWith("beforeunload", expect.any(Function)),
    );

    settle(generatedTripFixture);
    await waitFor(() =>
      expect(remove).toHaveBeenCalledWith("beforeunload", expect.any(Function)),
    );
  });

  // Re-creating it on each route would re-announce it to a screen reader.
  it("shows the planning toast once, however often the traveller changes route", async () => {
    const custom = vi.spyOn(toast, "custom");
    const { rerender } = renderAt("/about");
    start();
    await screen.findByText("Your trip is being planned");

    for (const path of ["/saved-trips", "/saved-trips/1", "/about"]) {
      routerState.pathname = path;
      rerender(
        <>
          <Toaster />
          <GenerationToast />
          <Starter />
        </>,
      );
    }

    const planning = custom.mock.calls.filter(([, options]) => options?.id === GENERATION_TOAST);
    expect(planning).toHaveLength(1);
  });

  // Only the latest finished trip keeps a toast; starting a new one on /form removes nothing.
  it("keeps the last trip's toast through the next generation, then replaces it", async () => {
    const second = { ...generatedTripFixture, tripUrl: "f0e1d2c3b4a5" };
    let settleSecond: (trip: typeof generatedTripFixture) => void = () => {};
    mockGenerate.mockReset();
    mockGenerate.mockResolvedValueOnce(generatedTripFixture);
    mockGenerate.mockReturnValueOnce(new Promise((r) => (settleSecond = r)));
    const tree = (
      <>
        <Toaster />
        <GenerationToast />
        <Starter />
      </>
    );
    const { rerender } = renderAt("/about");

    start();
    await screen.findByText("Your trip has been generated!");

    // On /form, the second generation starts; the first trip's View stays.
    routerState.pathname = "/form";
    window.history.replaceState(null, "", "/form");
    rerender(tree);
    start();
    await waitFor(() => expect(screen.getByTestId("pending")).toHaveTextContent("true"));
    // Past react-hot-toast's 1s exit, after which a dismissed toast leaves the page.
    await new Promise((r) => setTimeout(r, 1100));
    expect(screen.getByRole("link", { name: "View" })).toHaveAttribute(
      "href",
      `/trips/${generatedTripFixture.tripUrl}`,
    );

    // It lands off /form: one result toast, the newer trip's.
    routerState.pathname = "/about";
    window.history.replaceState(null, "", "/about");
    rerender(tree);
    settleSecond(second);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "View" })).toHaveAttribute("href", `/trips/${second.tripUrl}`),
    );
    expect(screen.getAllByText("Your trip has been generated!")).toHaveLength(1);
  });
});
