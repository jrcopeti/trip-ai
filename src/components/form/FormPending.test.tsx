import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderWithProviders, screen } from "@/test/render";
import { FormProvider } from "@/context/FormContext";
import { GenerationProvider } from "@/context/GenerationContext";
import { useFormData } from "@/hooks/useFormData";
import Form from "@/components/form/Form";
import { generateTrip } from "@/app/api/anthropicApi";
import { validInputs } from "@/test/fixtures";
import { stepCopy } from "@/components/form/content";
import { resetNextStubs } from "@/test/stubs/next";
import type { FormContextType } from "@/types";

vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("react-hot-toast", () => ({ default: { custom: vi.fn(), dismiss: vi.fn() } }));
vi.mock("@/components/ui/LoaderResponseAI", () => ({
  default: ({ onCancel }: { onCancel: () => void }) => (
    <>
      <p>Generating your trip</p>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </>
  ),
}));
vi.mock("@/hooks/useGeoNames", () => ({
  idleCityCheck: { isCityValid: false, isLoadingCityValid: false, message: "", place: null },
  useGeoNames: () => ({ isCityValid: true, isLoadingCityValid: false, message: "", place: null }),
}));
vi.mock("@/hooks/useCountries", () => ({
  useCountries: () => ({
    countries: [
      { value: "Portugal", label: "Portugal", code: "pt", flagUrl: "https://flagcdn.com/pt.svg" },
    ],
    isLoading: false,
  }),
}));

let ctx: FormContextType;

function Probe() {
  ctx = useFormData();
  return null;
}

/** The root's provider stays; `/form`'s, with the form, mounts only when `onForm`. */
const tree = (onForm = true) => (
  <GenerationProvider>
    {onForm && (
      <FormProvider>
        <Probe />
        <Form />
      </FormProvider>
    )}
  </GenerationProvider>
);

beforeEach(() => {
  resetNextStubs("/form");
  vi.mocked(generateTrip).mockReset();
});

// /form's provider unmounts with the route; the generation, in the root's, outlives it.
describe("Form — a generation still running when /form mounts again", () => {
  it("shows the loader rather than an empty form that could be sent twice", async () => {
    vi.mocked(generateTrip).mockReturnValue(new Promise(() => {}));
    const { rerender } = renderWithProviders(tree());
    await act(async () => {
      ctx.processForm(validInputs, undefined);
    });
    expect(screen.getByText("Generating your trip")).toBeInTheDocument();

    rerender(tree(false));
    expect(screen.queryByText("Generating your trip")).toBeNull();
    rerender(tree());

    expect(screen.getByText("Generating your trip")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 1, name: stepCopy[0].title }),
    ).not.toBeInTheDocument();
  });

  // The step and answers are the provider's, so the form reopens where it was sent from.
  it("goes back to the form when the loader's Cancel is pressed", async () => {
    vi.mocked(generateTrip).mockReturnValue(new Promise(() => {}));
    renderWithProviders(tree());
    await act(async () => {
      ctx.processForm(validInputs, undefined);
    });

    act(() => screen.getByRole("button", { name: "Cancel" }).click());

    expect(screen.queryByText("Generating your trip")).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("shows the form once nothing is generating", () => {
    renderWithProviders(tree());
    expect(
      screen.getByRole("heading", { level: 1, name: stepCopy[0].title }),
    ).toBeInTheDocument();
  });
});
