import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderWithProviders, waitFor } from "@/test/render";
import FormLayout from "@/app/form/layout";
import Providers from "@/app/providers";
import { useWatch } from "react-hook-form";
import { useFormData } from "@/hooks/useFormData";
import { resetNextStubs } from "@/test/stubs/next";
import type { FormContextType, Inputs } from "@/types";

vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("@/app/api/geoNamesApi", () => ({ resolvePlace: vi.fn() }));
vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));

let ctx: FormContextType;
let values: Inputs;

function Probe() {
  ctx = useFormData();
  return null;
}

// The answers as the review step reads them; only inside the form, where there is a control.
function ValuesProbe() {
  values = useWatch({ control: useFormData().control }) as Inputs;
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

  // Leaving /form unmounts its layout; the draft in sessionStorage is what brings the answers back.
  it("bring the answers back when /form mounts again", async () => {
    const tree = (
      <FormLayout>
        <Probe />
        <ValuesProbe />
      </FormLayout>
    );
    const first = renderWithProviders(tree);
    await act(async () => {
      ctx.setValue("userName", "Ana");
      ctx.setIsWeatherSelected(true);
    });
    expect(values.userName).toBe("Ana");
    first.unmount();

    renderWithProviders(tree);
    await waitFor(() => expect(values.userName).toBe("Ana"));
    expect(ctx.isWeatherSelected).toBe(true);
    expect(ctx.isDraftRestored).toBe(true);
  });

  it("start empty when there is no draft", async () => {
    renderWithProviders(
      <FormLayout>
        <Probe />
        <ValuesProbe />
      </FormLayout>,
    );
    await waitFor(() => expect(ctx.isDraftRestored).toBe(true));
    expect(values.userName).toBe("");
    expect(ctx.isWeatherSelected).toBe(false);
    expect(ctx.currentStep).toBe(0);
  });
});
