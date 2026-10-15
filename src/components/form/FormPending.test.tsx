import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { makeQueryClient, renderWithProviders, screen } from "@/test/render";
import FormProviders from "@/app/form/providers";
import { useFormData } from "@/hooks/useFormData";
import Form from "@/components/form/Form";
import { generateTrip } from "@/app/api/anthropicApi";
import { validInputs } from "@/test/fixtures";
import { stepCopy } from "@/components/form/content";
import { resetNextStubs } from "@/test/stubs/next";
import type { FormContextType } from "@/types";

vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));
vi.mock("@/app/api/forecastAction", () => ({ forecastForForm: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("react-hot-toast", () => ({ default: { custom: vi.fn() } }));
vi.mock("@/components/ui/LoaderResponseAI", () => ({
  default: () => <p>Generating your trip</p>,
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

const tree = (
  <FormProviders>
    <Probe />
    <Form />
  </FormProviders>
);

beforeEach(() => {
  resetNextStubs("/form");
  vi.mocked(generateTrip).mockReset();
});

// The providers unmount with /form, but the generation outlives them and still redirects.
describe("Form — a generation still running when /form mounts again", () => {
  it("shows the loader rather than an empty form that could be sent twice", async () => {
    vi.mocked(generateTrip).mockReturnValue(new Promise(() => {}));
    const queryClient = makeQueryClient();
    const first = renderWithProviders(tree, { queryClient });
    await act(async () => {
      ctx.processForm(validInputs, undefined);
    });
    expect(screen.getByText("Generating your trip")).toBeInTheDocument();
    first.unmount();

    renderWithProviders(tree, { queryClient });

    expect(screen.getByText("Generating your trip")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 1, name: stepCopy[0].title }),
    ).not.toBeInTheDocument();
  });

  it("shows the form once nothing is generating", () => {
    renderWithProviders(tree);
    expect(
      screen.getByRole("heading", { level: 1, name: stepCopy[0].title }),
    ).toBeInTheDocument();
  });
});
