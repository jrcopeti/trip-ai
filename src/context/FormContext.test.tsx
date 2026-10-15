import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import { FormProvider } from "@/context/FormContext";
import { useWatch } from "react-hook-form";
import { useFormData } from "@/hooks/useFormData";
import { steps } from "@/data";
import { lisbonPlace, validInputs, validTripRequest } from "@/test/fixtures";
import { resolvePlace } from "@/app/api/geoNamesApi";
import FormStep2 from "@/components/form/FormStep2";
import FormButtons from "@/components/form/FormButtons";
import { resetNextStubs } from "@/test/stubs/next";
import type { FieldName, FormContextType, Inputs, SelectedForecastDataTypes } from "@/types";

const generateForecast = vi.fn();
let forecastData: SelectedForecastDataTypes[] | undefined;
const generateResponseAI = vi.fn();

vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("@/hooks/useWeather", () => ({
  useWeather: () => ({ generateForecast, forecastData }),
}));
vi.mock("@/hooks/useTripResponse", () => ({
  useTripResponse: () => ({ generateResponseAI }),
}));
vi.mock("@/app/api/geoNamesApi", () => ({ resolvePlace: vi.fn() }));
vi.mock("@/hooks/useCountries", () => ({
  useCountries: () => ({
    countries: [
      {
        value: "Portugal",
        label: "Portugal",
        code: "pt",
        flagUrl: "https://flagcdn.com/pt.svg",
      },
    ],
    isLoading: false,
  }),
}));

/** Hands the live context out to the test and renders the current step number. */
let ctx: FormContextType;
let values: Inputs;

function Probe() {
  ctx = useFormData();
  // The answers as the review step reads them.
  values = useWatch({ control: ctx.control }) as Inputs;
  return <div data-testid="step">{ctx.currentStep}</div>;
}

function formTree() {
  return (
    <FormProvider>
      <Probe />
    </FormProvider>
  );
}

function renderForm() {
  return renderWithProviders(formTree());
}

/** Fills every field a given step validates, so `next()` is allowed through. */
async function fillStep(index: number) {
  const fields = steps[index].fields as FieldName[];
  await act(async () => {
    fields.forEach((field) => {
      ctx.setValue(field, validInputs[field] as string);
    });
  });
}

/** Walks from step 0 up to `target`, filling as it goes. */
async function advanceTo(target: number) {
  for (let i = 0; i < target; i++) {
    await fillStep(i);
    await act(async () => {
      await ctx.next();
    });
  }
}

beforeEach(() => {
  vi.mocked(resolvePlace).mockReset().mockResolvedValue({ ok: false, error: "not-found" });
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2030, 3, 1, 12, 0, 0));
  generateForecast.mockClear();
  generateResponseAI.mockReset();
  forecastData = undefined;
  resetNextStubs("/form");
  return () => vi.useRealTimers();
});

describe("FormContext — step navigation", () => {
  it("starts on step 0", () => {
    renderForm();
    expect(screen.getByTestId("step")).toHaveTextContent("0");
  });

  it("exposes the step value for the progress bar", async () => {
    renderForm();
    expect(ctx.stepValue).toBe(0);
    await advanceTo(1);
    expect(ctx.stepValue).toBe(16);
  });

  it("blocks on step 0 while the fields are empty", async () => {
    renderForm();
    await act(async () => {
      await ctx.next();
    });
    expect(screen.getByTestId("step")).toHaveTextContent("0");
    expect(ctx.errors.userName?.message).toBe("Name is required");
  });

  it("advances from step 0 once the fields are valid", async () => {
    renderForm();
    await fillStep(0);
    await act(async () => {
      await ctx.next();
    });
    expect(screen.getByTestId("step")).toHaveTextContent("1");
  });

  it.each(
    steps
      .map((step, index) => ({ index, fields: step.fields }))
      .filter((step) => step.fields.length > 0),
  )("blocks on step $index while its fields are invalid", async ({ index, fields }) => {
    renderForm();
    await advanceTo(index);
    expect(screen.getByTestId("step")).toHaveTextContent(String(index));

    // Blank out exactly the fields this step owns, then try to leave.
    await act(async () => {
      (fields as FieldName[]).forEach((field) => {
        const isList = field === "interests" || field === "ageRanges";
        ctx.setValue(field, (isList ? [] : "") as never);
      });
    });
    await act(async () => {
      await ctx.next();
    });

    expect(screen.getByTestId("step")).toHaveTextContent(String(index));
  });

  it.each(steps.map((_, index) => index).filter((i) => i < steps.length - 1))(
    "advances off step %i when it is valid",
    async (index) => {
      renderForm();
      await advanceTo(index);
      await fillStep(index);
      await act(async () => {
        await ctx.next();
      });
      expect(screen.getByTestId("step")).toHaveTextContent(String(index + 1));
    },
  );

  it("walks all seven steps with valid data", async () => {
    renderForm();
    await advanceTo(steps.length - 1);
    expect(screen.getByTestId("step")).toHaveTextContent(String(steps.length - 1));
  });

  it("passes straight through steps that validate nothing", async () => {
    renderForm();
    // Step 4 ("Required Items") and step 7 ("Review") declare no fields.
    expect(steps[3].fields).toEqual([]);
    await advanceTo(3);
    await act(async () => {
      await ctx.next();
    });
    expect(screen.getByTestId("step")).toHaveTextContent("4");
  });
});

describe("FormContext — prev()", () => {
  it("steps back one", async () => {
    renderForm();
    await advanceTo(2);
    await act(async () => {
      ctx.prev();
    });
    expect(screen.getByTestId("step")).toHaveTextContent("1");
  });

  it("floors at 0 rather than going negative", async () => {
    renderForm();
    await act(async () => {
      ctx.prev();
    });
    expect(screen.getByTestId("step")).toHaveTextContent("0");
  });

  it("does not validate on the way back", async () => {
    renderForm();
    await advanceTo(1);
    await act(async () => {
      ctx.setValue("userName", "");
    });
    await act(async () => {
      ctx.prev();
    });
    expect(screen.getByTestId("step")).toHaveTextContent("0");
  });

  it("tracks the direction of travel in delta", async () => {
    renderForm();
    await advanceTo(1);
    expect(ctx.delta).toBe(1);
    await act(async () => {
      ctx.prev();
    });
    expect(ctx.delta).toBe(-1);
  });
});

describe("FormContext — fetch triggers", () => {
  const datesStep = steps.length - 3; // step 5, "Dates and Weather"

  it("fetches the forecast at the place step 2 resolved, when leaving the dates step with weather selected", async () => {
    vi.mocked(resolvePlace).mockResolvedValue({ ok: true, place: lisbonPlace });
    renderForm();
    await advanceTo(datesStep);
    await waitFor(() => expect(ctx.cityCheck.place).toEqual(lisbonPlace), { timeout: 2000 });
    await act(async () => {
      ctx.setIsWeatherSelected(true);
    });
    await fillStep(datesStep);
    await act(async () => {
      await ctx.next();
    });

    expect(generateForecast).toHaveBeenCalledWith({ lat: lisbonPlace.lat, lon: lisbonPlace.lng });
  });

  it("does not fetch the forecast without a resolved place", async () => {
    renderForm();
    await advanceTo(datesStep);
    await act(async () => {
      ctx.setIsWeatherSelected(true);
    });
    await fillStep(datesStep);
    await act(async () => {
      await ctx.next();
    });

    expect(ctx.cityCheck.place).toBeNull();
    expect(generateForecast).not.toHaveBeenCalled();
  });

  it("does not fetch the forecast when weather is not selected", async () => {
    renderForm();
    await advanceTo(datesStep);
    await fillStep(datesStep);
    await act(async () => {
      await ctx.next();
    });
    expect(generateForecast).not.toHaveBeenCalled();
  });

  it("does not fetch the forecast when the dates step is invalid", async () => {
    renderForm();
    await advanceTo(datesStep);
    await act(async () => {
      ctx.setIsWeatherSelected(true);
      ctx.setValue("startDate", "");
    });
    await act(async () => {
      await ctx.next();
    });
    expect(generateForecast).not.toHaveBeenCalled();
  });
});

describe("FormContext — country autocomplete", () => {
  it("writes the country name from the selected code", async () => {
    renderForm();
    await act(async () => {
      ctx.handleSelectionAutocomplete("pt", "country");
    });
    expect(values.country).toBe("Portugal");
  });

  it("writes the passport's country name from the selected code", async () => {
    renderForm();
    await act(async () => {
      ctx.handleSelectionAutocomplete("pt", "passport");
    });
    expect(values.passport).toBe("Portugal");
  });

  it("clears the country when the selection is cleared", async () => {
    renderForm();
    await act(async () => {
      ctx.handleSelectionAutocomplete("pt", "country");
    });
    await act(async () => {
      ctx.handleSelectionAutocomplete(null, "country");
    });
    expect(values.country).toBe("");
  });

  it("clears the passport when the selection is cleared", async () => {
    renderForm();
    await act(async () => {
      ctx.handleSelectionAutocomplete("pt", "passport");
      ctx.handleSelectionAutocomplete(null, "passport");
    });
    expect(values.passport).toBe("");
  });

  it("passes step 0 with no passport — it is optional", async () => {
    renderForm();
    await fillStep(0);
    await act(async () => {
      ctx.handleSelectionAutocomplete(null, "passport");
    });
    await act(async () => {
      await ctx.next();
    });
    expect(ctx.currentStep).toBe(1);
  });

  it("derives the uppercase country code for the GeoNames lookup", async () => {
    renderForm();
    await act(async () => {
      ctx.handleSelectionAutocomplete("pt", "country");
    });
    expect(ctx.countryCode).toBe("PT");
  });

  it("checks each spelling once, however many components read the check", async () => {
    vi.mocked(resolvePlace).mockResolvedValue({ ok: true, place: lisbonPlace });
    renderWithProviders(
      <FormProvider>
        <Probe />
        <FormStep2 />
        <FormButtons />
      </FormProvider>,
    );
    await act(async () => {
      ctx.handleSelectionAutocomplete("pt", "country");
      ctx.setValue("city", "Lisbon");
    });

    await waitFor(() => expect(ctx.cityCheck.place).toEqual(lisbonPlace), { timeout: 2000 });
    expect(resolvePlace).toHaveBeenCalledTimes(1);
    expect(resolvePlace).toHaveBeenCalledWith("Lisbon", "PT");
  });
});

describe("FormContext — requiredItems field array", () => {
  it("starts with one blank row", () => {
    renderForm();
    expect(ctx.fields).toHaveLength(1);
  });

  it("appends and removes rows", async () => {
    renderForm();
    await act(async () => {
      ctx.append({ item: "camera" });
    });
    expect(ctx.fields).toHaveLength(2);

    await act(async () => {
      ctx.remove(1);
    });
    expect(ctx.fields).toHaveLength(1);
  });
});

describe("FormContext — processForm", () => {
  async function submitWith(overrides: Partial<Inputs> = {}) {
    renderForm();
    await act(async () => {
      ctx.processForm({ ...validInputs, ...overrides }, undefined);
    });
  }

  it("sends the trip request, with the submitted country's code", async () => {
    await submitWith();
    expect(generateResponseAI).toHaveBeenCalledTimes(1);
    expect(generateResponseAI.mock.calls[0][0]).toEqual(validTripRequest);
  });

  it("keeps the traveller's own spelling in the request", async () => {
    await submitWith({ userName: "  Ana  ", city: " Lisbon ", note: "  Sintra, please " });
    const request = generateResponseAI.mock.calls[0][0];
    expect(request).toMatchObject({ userName: "Ana", city: "Lisbon", note: "Sintra, please" });
  });

  it("lowercases and trims the name, city and note into formData", async () => {
    await submitWith({ userName: "  Ana  ", city: "  Lisbon ", note: "  Sintra  " });
    expect(ctx.formData.userName).toBe("ana");
    expect(ctx.formData.city).toBe("lisbon");
    expect(ctx.formData.note).toBe("sintra");
  });

  it("flattens requiredItems into lowercase strings", async () => {
    await submitWith({ requiredItems: [{ item: " Camera " }, { item: "Shoes" }] });
    expect(ctx.formData.requiredItems).toEqual(["camera", "shoes"]);
  });

  // A failed generation only shows a toast: the traveller can press "Plan my trip" again.
  // A trip that comes back leaves /form, and its layout's unmount clears the form.
  it("keeps the step, the answers and the weather choice after submitting", async () => {
    renderForm();
    await advanceTo(2);
    await act(async () => {
      ctx.setIsWeatherSelected(true);
    });
    await act(async () => {
      ctx.processForm(validInputs, undefined);
    });
    expect(screen.getByTestId("step")).toHaveTextContent("2");
    expect(ctx.isWeatherSelected).toBe(true);
    expect(values.userName).toBe(validInputs.userName);
  });

  it("sends the forecast days when weather is selected", async () => {
    forecastData = [
      {
        dt_txt: "2030-05-01 12:00:00",
        formattedTemp: "21°C",
        condition: "Clear",
        description: "clear sky",
      },
    ];
    renderForm();
    await act(async () => {
      ctx.setIsWeatherSelected(true);
    });
    await act(async () => {
      ctx.processForm(validInputs, undefined);
    });
    expect(generateResponseAI.mock.calls[0][0].forecast).toEqual([
      { date: "2030-05-01", temp: "21°C", condition: "Clear", description: "clear sky" },
    ]);
  });

  it("sends no forecast when weather is not selected", async () => {
    await submitWith();
    expect(generateResponseAI.mock.calls[0][0].forecast).toBeUndefined();
  });
});
