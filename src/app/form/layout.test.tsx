import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderWithProviders } from "@/test/render";
import FormLayout from "@/app/form/layout";
import Providers from "@/app/providers";
import { useFormData } from "@/hooks/useFormData";
import { resetNextStubs } from "@/test/stubs/next";
import type { FormContextType } from "@/types";

vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("@/app/api/geoNamesApi", () => ({ resolvePlace: vi.fn() }));
vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));
vi.mock("@/app/api/forecastAction", () => ({ forecastForForm: vi.fn() }));

let ctx: FormContextType;

function Probe() {
  ctx = useFormData();
  return null;
}

beforeEach(() => {
  resetNextStubs("/form");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
});

describe("the form's providers", () => {
  it("wrap /form", () => {
    renderWithProviders(
      <FormLayout>
        <Probe />
      </FormLayout>,
    );
    expect(ctx.control).toBeDefined();
  });

  // Every other route renders without them, so none runs the form or fetches the countries.
  it("are not in the app-wide providers", () => {
    renderWithProviders(
      <Providers>
        <Probe />
      </Providers>,
    );
    expect(ctx.control).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  // Leaving /form unmounts its layout, which is what clears the form after a trip.
  it("start a fresh form each time /form mounts", async () => {
    const tree = (
      <FormLayout>
        <Probe />
      </FormLayout>
    );
    const first = renderWithProviders(tree);
    await act(async () => {
      ctx.setValue("userName", "Ana");
      ctx.setIsWeatherSelected(true);
    });
    expect(ctx.reviewFormData.userName).toBe("Ana");
    first.unmount();

    renderWithProviders(tree);
    expect(ctx.reviewFormData.userName).toBe("");
    expect(ctx.isWeatherSelected).toBe(false);
    expect(ctx.currentStep).toBe(0);
  });
});
