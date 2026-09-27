import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import { ImageProvider } from "@/context/ImageContext";
import { useImage } from "@/hooks/useImage";
import { fetchTripImage } from "@/app/api/unsplashApi";
import { imageDataFixture } from "@/test/fixtures";
import type { ImageContextType } from "@/types";

vi.mock("@/app/api/unsplashApi", () => ({ fetchTripImage: vi.fn() }));

const mockFetch = vi.mocked(fetchTripImage);

let ctx: ImageContextType;

function Probe() {
  ctx = useImage();
  return (
    <div>
      <span data-testid="pending">{String(ctx.isPendingImage)}</span>
      <span data-testid="image">{ctx.imageData?.tripImage ?? "none"}</span>
    </div>
  );
}

function renderImage() {
  return renderWithProviders(
    <ImageProvider>
      <Probe />
    </ImageProvider>,
  );
}

beforeEach(() => {
  mockFetch.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("ImageContext", () => {
  it("starts with no image data", () => {
    renderImage();
    expect(screen.getByTestId("image")).toHaveTextContent("none");
    expect(ctx.imageData).toBeUndefined();
  });

  it("fetches by city name", async () => {
    mockFetch.mockResolvedValue(imageDataFixture);
    renderImage();

    ctx.generateImage("lisbon");

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("lisbon");
    });
  });

  it("exposes all five images and the blur placeholder on success", async () => {
    mockFetch.mockResolvedValue(imageDataFixture);
    renderImage();

    ctx.generateImage("lisbon");

    await waitFor(() => {
      expect(ctx.imageData).toEqual(imageDataFixture);
    });
    expect(ctx.imageData?.placeholder).toBe(imageDataFixture.placeholder);
  });

  it("reports pending while the request is in flight", async () => {
    let resolve: (value: typeof imageDataFixture) => void = () => {};
    mockFetch.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    renderImage();

    ctx.generateImage("lisbon");
    await waitFor(() => {
      expect(screen.getByTestId("pending")).toHaveTextContent("true");
    });

    resolve(imageDataFixture);
    await waitFor(() => {
      expect(screen.getByTestId("pending")).toHaveTextContent("false");
    });
  });

  it("surfaces the error and leaves imageData undefined when the fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("Error fetching image"));
    renderImage();

    ctx.generateImage("nowhere");

    await waitFor(() => {
      expect(ctx.errorImage).toBeInstanceOf(Error);
    });
    expect(ctx.imageData).toBeUndefined();
    expect(screen.getByTestId("image")).toHaveTextContent("none");
  });
});
