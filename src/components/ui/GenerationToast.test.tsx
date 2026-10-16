import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { useIsMutating } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import GenerationToast from "@/components/ui/GenerationToast";
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
    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
  });

  it("shows nothing on /form, where the loader says it", async () => {
    renderAt("/form");

    start();

    await waitFor(() => expect(screen.getByTestId("pending")).toHaveTextContent("true"));
    expect(screen.queryByText("Your trip is being planned")).toBeNull();
  });

  it("becomes the way to the trip when it lands, without moving the traveller", async () => {
    renderAt("/saved-trips");
    start();
    await screen.findByText("Your trip is being planned");

    settle(generatedTripFixture);

    const view = await screen.findByRole("link", { name: "View" });
    expect(view).toHaveAttribute("href", `/trips/${generatedTripFixture.tripUrl}`);
    expect(screen.queryByText("Your trip is being planned")).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it("stops by keyboard: nothing is pending and nothing shows when the trip lands", async () => {
    const user = userEvent.setup();
    renderAt("/about");
    start();
    await screen.findByText("Your trip is being planned");

    await user.tab();
    expect(screen.getByRole("button", { name: "Stop" })).toHaveFocus();
    await user.keyboard("{Enter}");

    await waitFor(() => expect(screen.getByTestId("pending")).toHaveTextContent("false"));
    await waitFor(() => expect(screen.queryByText("Your trip is being planned")).toBeNull());

    settle(generatedTripFixture);
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByRole("link", { name: "View" })).toBeNull();
    expect(replace).not.toHaveBeenCalled();
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
});
