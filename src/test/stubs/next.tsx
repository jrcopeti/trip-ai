import type { ImgHTMLAttributes } from "react";
import { vi } from "vitest";

/**
 * Shared stubs for the `next/*` modules. Import the spies here so a test can
 * assert on navigation without re-declaring the mock shape:
 *
 *   vi.mock("next/navigation", () => import("@/test/stubs/next"));
 */
export const push = vi.fn();
export const replace = vi.fn();
export const back = vi.fn();
export const prefetch = vi.fn();
export const refresh = vi.fn();
export const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

export const routerState = {
  pathname: "/",
  params: {} as Record<string, string>,
};

export const useRouter = () => ({ push, replace, back, prefetch, refresh });
export const usePathname = () => routerState.pathname;
export const useParams = () => routerState.params;
export const useSearchParams = () => new URLSearchParams();

export function resetNextStubs(pathname = "/", params: Record<string, string> = {}) {
  routerState.pathname = pathname;
  routerState.params = params;
  [push, replace, back, prefetch, refresh, notFound].forEach((fn) => fn.mockClear());
}

/** Passthrough `next/image` — jsdom has no loader, and `fill`/`priority` are not valid DOM attributes. */
type NextImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
  placeholder?: string;
  blurDataURL?: string;
  quality?: number;
  src: string | { src: string };
};

export function NextImage({
  fill: _fill,
  priority: _priority,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  quality: _quality,
  src,
  alt,
  ...rest
}: NextImageProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={typeof src === "string" ? src : src.src} alt={alt ?? ""} {...rest} />;
}
