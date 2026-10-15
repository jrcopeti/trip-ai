import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeQueryClient, renderWithProviders, waitFor } from "@/test/render";
import { useCountries } from "@/hooks/useCountries";

const mockGet = vi.fn();
const answer = (body: unknown, status = 200) =>
  mockGet.mockResolvedValue(new Response(JSON.stringify(body), { status }));

let hook: ReturnType<typeof useCountries>;

function Probe() {
  hook = useCountries();
  return null;
}

function OtherReader() {
  useCountries();
  return null;
}

beforeEach(() => {
  mockGet.mockReset();
  vi.stubGlobal("fetch", mockGet);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("useCountries", () => {
  it("fetches the flag CDN's code list", async () => {
    answer({ pt: "Portugal" });
    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(hook.countries).toHaveLength(1);
    });
    expect(mockGet).toHaveBeenCalledWith("https://flagcdn.com/en/codes.json");
  });

  it("maps each entry to a value, label, code and flag url", async () => {
    answer({ pt: "Portugal" });
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
    answer({ jp: "Japan", pt: "Portugal", br: "Brazil" });
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.countries).toHaveLength(3));
    expect(hook.countries.map((c) => c.value)).toEqual([
      "Brazil",
      "Japan",
      "Portugal",
    ]);
  });

  it("drops US states, the EU and the UN, but keeps the UK's nations", async () => {
    answer({
      pt: "Portugal",
      "gb-eng": "England",
      gb: "United Kingdom",
      "us-ny": "New York",
      us: "United States",
      eu: "European Union",
      un: "United Nations",
    });
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.isLoading).toBe(false));
    expect(hook.countries.map((c) => c.code)).toEqual(["gb-eng", "pt", "gb", "us"]);
  });

  it("truncates a label past 25 characters, leaving the value intact", async () => {
    const long = "United Kingdom of Great Britain and Northern Ireland";
    answer({ gb: long });
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.countries).toHaveLength(1));
    expect(hook.countries[0].label).toBe(`${long.slice(0, 25)}...`);
    expect(hook.countries[0].value).toBe(long);
  });

  it("leaves a label of exactly 25 characters unmarked", async () => {
    const exact = "a".repeat(25);
    answer({ xx: exact });
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.countries).toHaveLength(1));
    expect(hook.countries[0].label).toBe(exact);
  });

  // One retry, a second later: the country fields are disabled while it loads.
  it("retries once, then ends up with an empty list when the request fails", async () => {
    mockGet.mockRejectedValue(new Error("network down"));
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.isLoading).toBe(false), { timeout: 3000 });
    expect(hook.countries).toEqual([]);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it("ends up with an empty list when the CDN answers with an error status", async () => {
    mockGet.mockImplementation(async () => new Response("{}", { status: 404 }));
    renderWithProviders(<Probe />);

    await waitFor(() => expect(hook.isLoading).toBe(false), { timeout: 3000 });
    expect(hook.countries).toEqual([]);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it("clears the loading flag once the request settles", async () => {
    answer({ pt: "Portugal" });
    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(hook.isLoading).toBe(false);
    });
    expect(hook.countries).toHaveLength(1);
  });

  // The step 1 and step 2 comboboxes and FormProvider all read it.
  it("asks the CDN once for every reader", async () => {
    answer({ pt: "Portugal" });
    renderWithProviders(
      <>
        <Probe />
        <OtherReader />
        <OtherReader />
      </>,
    );

    await waitFor(() => expect(hook.countries).toHaveLength(1));
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it("keeps the list when /form mounts again", async () => {
    answer({ pt: "Portugal" });
    const queryClient = makeQueryClient();
    const first = renderWithProviders(<Probe />, { queryClient });
    await waitFor(() => expect(hook.countries).toHaveLength(1));
    first.unmount();

    renderWithProviders(<Probe />, { queryClient });
    expect(hook.countries).toHaveLength(1);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
