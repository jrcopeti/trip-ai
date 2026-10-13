import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, within } from "@/test/render";
import { tripFixture, tripFixture2 } from "@/test/fixtures";
import { stubSrc } from "@/test/imageStub";
import HeroDeck from "./HeroDeck";

vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

const third = { ...tripFixture, id: 7, city: "oaxaca", country: "Mexico", userName: "dora" };

describe("HeroDeck", () => {
  it("deals the latest saved trips as polaroids, each linking to its trip", () => {
    renderWithProviders(<HeroDeck trips={[tripFixture2, tripFixture, third]} />);

    const deck = screen.getByRole("list", { name: "Latest saved trips" });
    const links = within(deck).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/saved-trips/2",
      "/saved-trips/1",
      "/saved-trips/7",
    ]);
    expect(screen.getByRole("link", { name: "kyoto, Japan, bruno" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "oaxaca, Mexico" })).toBeInTheDocument();
  });

  it("shows only the trips there are when fewer than three are saved", () => {
    renderWithProviders(<HeroDeck trips={[tripFixture]} />);

    expect(screen.getAllByRole("link", { name: /, ana$/ })).toHaveLength(1);
  });

  it("falls back to the bundled photo for a trip saved without one", () => {
    renderWithProviders(<HeroDeck trips={[{ ...tripFixture, image: null }]} />);

    const link = screen.getByRole("link", { name: "lisbon, Portugal, ana" });
    expect(link.querySelector("img")).toHaveAttribute("src", stubSrc("1.jpg"));
  });

  it("deals no deck when nothing is saved", () => {
    renderWithProviders(<HeroDeck trips={[]} />);

    expect(screen.queryByRole("list", { name: "Latest saved trips" })).not.toBeInTheDocument();
    expect(screen.queryAllByRole("heading", { level: 2 })).toHaveLength(0);
  });
});
