import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebouncedValue", () => {
  it("starts with the initial value", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 300));

    expect(result.current).toBe("a");
  });

  it("holds a new value back until the delay has passed", () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: "a" },
    });

    rerender({ v: "b" });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("b");
  });

  it("restarts the wait on every change, settling on the last value", () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: "" },
    });

    for (const v of ["k", "ky", "kyo"]) {
      rerender({ v });
      act(() => vi.advanceTimersByTime(200));
    }
    expect(result.current).toBe("");

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("kyo");
  });
});
