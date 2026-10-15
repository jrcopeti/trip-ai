import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/test/render";
import { FormProvider } from "@/context/FormContext";
import { useFormData } from "@/hooks/useFormData";
import Form from "@/components/form/Form";
import { steps } from "@/data";
import { validInputs } from "@/test/fixtures";
import { buttons, destination, stepCopy } from "@/components/form/content";
import type { FieldName } from "@/types";

const { renders, Counted } = vi.hoisted(() => {
  const { createElement, Profiler } = require("react") as typeof import("react");
  const renders = { progress: 0, step1: 0, step2: 0 };
  // A Profiler counts every commit its subtree renders in, the real component's own
  // context-driven renders included, which a plain wrapper wouldn't see.
  function Counted({ id, of }: { id: keyof typeof renders; of: React.ComponentType }) {
    return createElement(Profiler, { id, onRender: () => renders[id]++ }, createElement(of));
  }
  return { renders, Counted };
});

// The real components, counted: what a keystroke re-renders is the measure.
vi.mock("@/components/form/Progress", async (importOriginal) => {
  const { default: Real } = await importOriginal<typeof import("@/components/form/Progress")>();
  return { default: () => <Counted id="progress" of={Real} /> };
});
vi.mock("@/components/form/FormStep1", async (importOriginal) => {
  const { default: Real } = await importOriginal<typeof import("@/components/form/FormStep1")>();
  return { default: () => <Counted id="step1" of={Real} /> };
});
vi.mock("@/components/form/FormStep2", async (importOriginal) => {
  const { default: Real } = await importOriginal<typeof import("@/components/form/FormStep2")>();
  return { default: () => <Counted id="step2" of={Real} /> };
});
vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));
vi.mock("@/app/api/geoNamesApi", () => ({
  resolvePlace: vi.fn().mockResolvedValue({ ok: false, error: "not-found" }),
}));
// Stable across renders, as the real ones are (TanStack's `mutate`, the query's data):
// a new function or array per render would change the context and void the measure.
const { generateTrip, reset, countries } = vi.hoisted(() => ({
  generateTrip: () => {},
  reset: () => {},
  countries: [
    { value: "Portugal", label: "Portugal", code: "pt", flagUrl: "https://flagcdn.com/pt.svg" },
  ],
}));
vi.mock("@/hooks/useTripGeneration", () => ({
  generateTripKey: ["generateTrip"],
  useTripGeneration: () => ({ generateTrip, isPending: false, error: null, reset }),
}));
vi.mock("@/hooks/useCountries", () => ({
  useCountries: () => ({ countries, isLoading: false }),
}));
vi.mock("react-hot-toast", () => ({ default: { custom: vi.fn() } }));

let setValue: ReturnType<typeof useFormData>["setValue"];

function Probe() {
  setValue = useFormData().setValue;
  return null;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2030, 3, 1, 12, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("FormContext — a keystroke in the city field", () => {
  it("re-renders the destination step, not the progress bar or the other steps", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <FormProvider>
        <Probe />
        <Form />
      </FormProvider>,
    );
    await act(async () => {
      (steps[0].fields as FieldName[]).forEach((field) => {
        setValue(field, validInputs[field] as string);
      });
    });
    await user.click(screen.getByRole("button", { name: buttons.next }));
    await screen.findByRole("heading", { level: 1, name: stepCopy[1].title });
    await act(async () => setValue("country", "Portugal"));

    const city = screen.getByRole("textbox", { name: new RegExp(destination.city.label) });
    await user.click(city);
    const before = { ...renders };
    await user.type(city, "Lisbon");

    const after = {
      progress: renders.progress - before.progress,
      step1: renders.step1 - before.step1,
      step2: renders.step2 - before.step2,
    };
    // The measure, printed for the plan: before and after the split.
    console.info("renders while typing a six-letter city:", after);
    expect(after.progress).toBe(0);
    expect(after.step1).toBe(0);
    expect(after.step2).toBeGreaterThan(0);
  });
});
