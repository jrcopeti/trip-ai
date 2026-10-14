import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/test/render";
import { TripProvider } from "@/context/TripContext";
import { FormProvider } from "@/context/FormContext";
import { useFormData } from "@/hooks/useFormData";
import Form from "@/components/form/Form";
import { generateTrip } from "@/app/api/anthropicApi";
import { steps } from "@/data";
import { tripDataFixture, validInputs } from "@/test/fixtures";
import { failure, stepCopy } from "@/components/form/content";
import { resetNextStubs } from "@/test/stubs/next";
import toast from "react-hot-toast";
import type { FieldName, FormContextType } from "@/types";

// The real TripProvider and FormProvider, so the mutation's error and its reset
// drive what Form shows. Only the server action and the browser-side lookups are mocked.
vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("react-hot-toast", () => ({ default: { custom: vi.fn() } }));
vi.mock("@/hooks/useWeather", () => ({
  useWeather: () => ({ generateForecast: vi.fn(), forecastData: undefined }),
}));
vi.mock("@/hooks/useImage", () => ({
  useImage: () => ({ generateImage: vi.fn() }),
}));
vi.mock("@/hooks/useGeoNames", () => ({
  idleCityCheck: { isCityValid: false, isLoadingCityValid: false, message: "", place: null },
  useGeoNames: () => ({
    isCityValid: true,
    isLoadingCityValid: false,
    message: "Found Lisbon, Portugal",
    place: null,
  }),
}));
vi.mock("@/hooks/useCountries", () => ({
  useCountries: () => ({
    countries: [
      { value: "Portugal", label: "Portugal", code: "pt", flagUrl: "https://flagcdn.com/pt.svg" },
    ],
    isLoading: false,
  }),
}));

const mockGenerate = vi.mocked(generateTrip);
let ctx: FormContextType;

function Probe() {
  ctx = useFormData();
  return null;
}

/** Fills every field, then submits what the form holds, as "Plan my trip" would. */
async function fillAndSubmit() {
  await act(async () => {
    steps.flatMap((step) => step.fields as FieldName[]).forEach((field) => {
      ctx.setValue(field, validInputs[field] as string);
    });
  });
  await act(async () => {
    ctx.processForm(validInputs, undefined);
  });
}

beforeEach(() => {
  resetNextStubs();
  mockGenerate.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
  renderWithProviders(
    <TripProvider>
      <FormProvider>
        <Probe />
        <Form />
      </FormProvider>
    </TripProvider>,
  );
});

describe("Form — a failed generation", () => {
  it("shows the failure panel, and Try again brings the filled-in form back", async () => {
    mockGenerate.mockRejectedValue(new Error("The model did not return a trip"));
    await fillAndSubmit();

    expect(await screen.findByRole("heading", { name: failure.message })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: failure.button }));

    expect(
      await screen.findByRole("heading", { level: 1, name: stepCopy[0].title }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: failure.message })).not.toBeInTheDocument();
    expect(ctx.reviewFormData.userName).toBe(validInputs.userName);
    expect(ctx.reviewFormData.city).toBe(validInputs.city);
  });

  it("doesn't announce the city check again when Try again brings the form back", async () => {
    mockGenerate.mockRejectedValue(new Error("unavailable"));
    await fillAndSubmit();
    vi.mocked(toast.custom).mockClear();

    await userEvent.click(await screen.findByRole("button", { name: failure.button }));

    await screen.findByRole("heading", { level: 1, name: stepCopy[0].title });
    expect(toast.custom).not.toHaveBeenCalled();
  });

  it("sends the request again on the next submit", async () => {
    mockGenerate.mockRejectedValueOnce(new Error("unavailable"));
    mockGenerate.mockResolvedValueOnce(tripDataFixture);
    await fillAndSubmit();
    await userEvent.click(await screen.findByRole("button", { name: failure.button }));

    await fillAndSubmit();

    expect(mockGenerate).toHaveBeenCalledTimes(2);
  });
});
