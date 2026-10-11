import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen, waitFor, within } from "@/test/render";
import SiteNav from "@/components/ui/SiteNav";
import { resetNextStubs, routerState } from "@/test/stubs/next";

vi.mock("next/navigation", () => import("@/test/stubs/next"));

/** The disclosure panel, which only exists in the DOM while it is open. */
function panel() {
  return document.getElementById("site-menu");
}

function trigger() {
  return screen.getByRole("button", { name: "Menu" });
}

beforeEach(() => {
  resetNextStubs();
});

describe("SiteNav", () => {
  describe("active route", () => {
    it("marks the link for the current route", () => {
      resetNextStubs("/form");
      renderWithProviders(<SiteNav />);

      expect(screen.getByRole("link", { name: "New trip" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByRole("link", { name: "About" })).not.toHaveAttribute(
        "aria-current",
      );
    });

    it("marks the parent link for a nested route", () => {
      resetNextStubs("/saved-trips/42");
      renderWithProviders(<SiteNav />);

      expect(screen.getByRole("link", { name: "Saved trips" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    it("marks nothing on the landing page", () => {
      resetNextStubs("/");
      renderWithProviders(<SiteNav />);

      for (const name of ["New trip", "Saved trips", "About"]) {
        expect(screen.getByRole("link", { name })).not.toHaveAttribute(
          "aria-current",
        );
      }
    });
  });

  describe("the mobile menu", () => {
    it("starts closed", () => {
      renderWithProviders(<SiteNav />);

      expect(trigger()).toHaveAttribute("aria-expanded", "false");
      expect(panel()).toBeNull();
    });

    it("the trigger toggles it", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SiteNav />);

      await user.click(trigger());
      expect(trigger()).toHaveAttribute("aria-expanded", "true");
      expect(panel()).not.toBeNull();

      await user.click(trigger());
      expect(trigger()).toHaveAttribute("aria-expanded", "false");
    });

    it("names the panel it controls", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SiteNav />);
      await user.click(trigger());

      expect(trigger()).toHaveAttribute("aria-controls", "site-menu");
      expect(panel()).toBeInstanceOf(HTMLElement);
    });

    it("stacks the three links and the Plan a trip pill", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SiteNav />);
      await user.click(trigger());

      const links = within(panel() as HTMLElement).getAllByRole("link");
      expect(links.map((link) => link.textContent)).toEqual([
        "New trip",
        "Saved trips",
        "About",
        "Plan a trip",
      ]);
    });

    it("Escape closes it and puts focus back on the trigger", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SiteNav />);
      await user.click(trigger());

      await user.keyboard("{Escape}");

      expect(trigger()).toHaveAttribute("aria-expanded", "false");
      expect(trigger()).toHaveFocus();
    });

    it("clicking a link closes it", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SiteNav />);
      await user.click(trigger());

      await user.click(
        within(panel() as HTMLElement).getByRole("link", { name: "About" }),
      );

      expect(trigger()).toHaveAttribute("aria-expanded", "false");
    });

    it("a route change closes it", async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithProviders(<SiteNav />);
      await user.click(trigger());

      // What a client-side push looks like from here: the component re-renders
      // with a new pathname, and nothing else unmounts.
      routerState.pathname = "/about";
      rerender(<SiteNav />);

      await waitFor(() =>
        expect(trigger()).toHaveAttribute("aria-expanded", "false"),
      );
    });

    it("is hidden above md, trigger and panel both", async () => {
      // jsdom applies no stylesheet, so the breakpoint itself cannot be
      // exercised here — what this pins is that the hiding stays CSS-only.
      // Branching on matchMedia instead would change the tree between server
      // and client. The rendered behaviour at 1440 is covered in Playwright.
      const user = userEvent.setup();
      renderWithProviders(<SiteNav />);

      expect(trigger().className).toContain("md:hidden");

      await user.click(trigger());
      expect(panel()?.className).toContain("md:hidden");
    });
  });

  it("keeps the wordmark the intro measures", () => {
    renderWithProviders(<SiteNav />);

    const wordmark = document.querySelectorAll("[data-wordmark]");
    expect(wordmark).toHaveLength(1);
    expect(wordmark[0]).toHaveTextContent("trip ai");
  });
});
