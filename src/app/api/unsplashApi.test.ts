import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPlaiceholder } from "plaiceholder";
import { fetchTripImage } from "./unsplashApi";

vi.mock("plaiceholder", () => ({ getPlaiceholder: vi.fn() }));

const fetchMock = vi.fn();
const photo = (n: number) => `https://images.unsplash.com/photo-${n}`;
const search = { results: [0, 1, 2, 3, 4, 5].map((n) => ({ urls: { regular: photo(n) } })) };
const imageBytes = new Uint8Array([1, 2, 3]);

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(getPlaiceholder).mockReset();
  vi.mocked(getPlaiceholder).mockResolvedValue({ base64: "data:image/png;base64,blur" } as never);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("fetchTripImage", () => {
  it("asks for six photos of the city, keeps them in order and blurs the first", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify(search)))
      .mockResolvedValueOnce(new Response(imageBytes));

    const result = await fetchTripImage("São Paulo");

    const { searchParams } = new URL(fetchMock.mock.calls[0][0]);
    expect(searchParams.get("query")).toBe("São Paulo");
    expect(searchParams.get("per_page")).toBe("6");
    expect(fetchMock.mock.calls[1][0]).toBe(photo(0));
    expect([...vi.mocked(getPlaiceholder).mock.calls[0][0] as Buffer]).toEqual([1, 2, 3]);
    expect(result).toEqual({
      tripImages: [0, 1, 2, 3, 4, 5].map(photo),
      placeholder: "data:image/png;base64,blur",
    });
  });

  it("fails when the search answers with an error status", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Rate Limit Exceeded", { status: 403 }));

    await expect(fetchTripImage("Lisbon")).rejects.toThrow("Error fetching image");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fails without a download when the search finds no photos", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ results: [] })));

    await expect(fetchTripImage("Atlantis")).rejects.toThrow("Error fetching image");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fails when the photo itself can't be downloaded", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify(search)))
      .mockResolvedValueOnce(new Response("", { status: 404 }));

    await expect(fetchTripImage("Lisbon")).rejects.toThrow("Error fetching image");
    expect(getPlaiceholder).not.toHaveBeenCalled();
  });
});
