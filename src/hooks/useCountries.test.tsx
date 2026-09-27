import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { renderWithProviders, waitFor } from "@/test/render";
import { useCountries } from "@/hooks/useCountries";

vi.mock("axios", () => ({
  default: { get: vi.fn() },
}));

const mockGet = vi.mocked(axios.get);

let hook: ReturnType<typeof useCountries>;

function Probe() {
  hook = useCountries();
  return null;
}

beforeEach(() => {
  mockGet.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("useCountries", () => {
  it("fetches the flag CDN's code list", async () => {
    mockGet.mockResolvedValue({ data: { pt: "Portugal" } });
    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(hook.countries).toHaveLength(1);
    });
    expect(mockGet).toHaveBeenCalledWith("https://flagcdn.com/en/codes.json");
  });

  it("maps each entry to a value, label, code and flag url", async () => {
    mockGet.mockResolvedValue({ data: { pt: "Portugal" } });
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.countries).toHaveLength(1));
    expect(hook.countries[0]).toEqual({
      value: "Portugal",
      label: "Portugal",
      code: "pt",
      flagUrl: "https://flagcdn.com/pt.svg",
    });
  });

  it("sorts alphabetically by country name", async () => {
    mockGet.mockResolvedValue({
      data: { jp: "Japan", pt: "Portugal", br: "Brazil" },
    });
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.countries).toHaveLength(3));
    expect(hook.countries.map((c) => c.value)).toEqual([
      "Brazil",
      "Japan",
      "Portugal",
    ]);
  });

  it("truncates a label past 25 characters, leaving the value intact", async () => {
    const long = "United Kingdom of Great Britain and Northern Ireland";
    mockGet.mockResolvedValue({ data: { gb: long } });
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.countries).toHaveLength(1));
    expect(hook.countries[0].label).toBe(`${long.slice(0, 25)}...`);
    expect(hook.countries[0].value).toBe(long);
  });

  it("leaves a label of exactly 25 characters unmarked", async () => {
    const exact = "a".repeat(25);
    mockGet.mockResolvedValue({ data: { xx: exact } });
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.countries).toHaveLength(1));
    expect(hook.countries[0].label).toBe(exact);
  });

  it("ends up with an empty list when the request fails", async () => {
    mockGet.mockRejectedValue(new Error("network down"));
    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(hook.isLoading).toBe(false);
    });
    expect(hook.countries).toEqual([]);
  });

  it("clears the loading flag once the request settles", async () => {
    mockGet.mockResolvedValue({ data: { pt: "Portugal" } });
    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(hook.isLoading).toBe(false);
    });
    expect(hook.countries).toHaveLength(1);
  });
});
