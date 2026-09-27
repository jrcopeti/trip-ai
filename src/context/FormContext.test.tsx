import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderWithProviders, screen } from "@/test/render";
import { FormProvider } from "@/context/FormContext";
import { useFormData } from "@/hooks/useFormData";
import { steps } from "@/data";
import { validInputs } from "@/test/fixtures";
import type { FieldName, FormContextType, Inputs } from "@/types";

const generateForecast = vi.fn();
const generateImage = vi.fn();
const generateResponseAI = vi.fn();

vi.mock("@/hooks/useWeather", () => ({
  useWeather: () => ({ generateForecast, forecastData: undefined }),
}));
vi.mock("@/hooks/useImage", () => ({
  useImage: () => ({ generateImage }),
}));
vi.mock("@/hooks/useTripResponse", () => ({
  useTripResponse: () => ({ generateResponseAI }),
}));
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

function Probe() {
  ctx = useFormData();
  return <div data-testid="step">{ctx.currentStep}</div>;
}

function renderForm() {
  return renderWithProviders(
    <FormProvider>
      <Probe />
    </FormProvider>,
  );
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
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2030, 3, 1, 12, 0, 0));
  generateForecast.mockClear();
  generateImage.mockClear();
  generateResponseAI.mockClear();
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
        ctx.setValue(field, (field === "interests" ? [] : "") as never);
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
  const interestsStep = steps.length - 2; // step 6, "Interests and Notes"

  it("fetches the forecast when leaving the dates step with weather selected", async () => {
    renderForm();
    await advanceTo(datesStep);
    await act(async () => {
      ctx.setIsWeatherSelected(true);
    });
    await fillStep(datesStep);
    await act(async () => {
      await ctx.next();
    });

    expect(generateForecast).toHaveBeenCalledWith({
      city: validInputs.city,
      country: validInputs.country,
    });
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

  it("fetches the city image when leaving the interests step", async () => {
    renderForm();
    await advanceTo(interestsStep);
    await fillStep(interestsStep);
    await act(async () => {
      await ctx.next();
    });
    expect(generateImage).toHaveBeenCalledWith(validInputs.city);
  });

  it("does not fetch the image on any earlier step", async () => {
    renderForm();
    await advanceTo(interestsStep);
    expect(generateImage).not.toHaveBeenCalled();
  });
});

describe("FormContext — country autocomplete", () => {
  it("writes the country name and its flag from the selected code", async () => {
    renderForm();
    await act(async () => {
      ctx.handleSelectionAutocomplete("pt", "country");
    });
    expect(ctx.reviewFormData.country).toBe("Portugal");
    expect(ctx.reviewFormData.flagUrl).toBe("https://flagcdn.com/pt.svg");
  });

  it("writes no flag for a non-country field", async () => {
    renderForm();
    await act(async () => {
      ctx.handleSelectionAutocomplete("pt", "nationality");
      // `reviewFormData` is `getValues()`, read at render time. Only `city` and
      // `country` are watched, so writing to `nationality` alone re-renders
      // nothing and the context the test holds would still be the old one.
      ctx.setValue("city", "Lisbon");
    });
    expect(ctx.reviewFormData.nationality).toBe("Portugal");
    expect(ctx.reviewFormData.flagUrl).toBe("");
  });

  it("ignores a null selection", async () => {
    renderForm();
    await act(async () => {
      ctx.handleSelectionAutocomplete(null, "country");
    });
    expect(ctx.reviewFormData.country).toBe("");
  });

  it("derives the uppercase country code for the GeoNames lookup", async () => {
    renderForm();
    await act(async () => {
      ctx.handleSelectionAutocomplete("pt", "country");
    });
    expect(ctx.countryCode).toBe("PT");
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

  it("sends a prompt to the AI", async () => {
    await submitWith();
    expect(generateResponseAI).toHaveBeenCalledTimes(1);
    expect(generateResponseAI.mock.calls[0][0]).toContain("lisbon");
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

  it("resets back to step 0", async () => {
    renderForm();
    await advanceTo(2);
    await act(async () => {
      ctx.processForm(validInputs, undefined);
    });
    expect(screen.getByTestId("step")).toHaveTextContent("0");
  });

  it("clears the weather selection", async () => {
    renderForm();
    await act(async () => {
      ctx.setIsWeatherSelected(true);
    });
    await act(async () => {
      ctx.processForm(validInputs, undefined);
    });
    expect(ctx.isWeatherSelected).toBe(false);
  });

  it("uses the weather-aware prompt when weather is selected", async () => {
    renderForm();
    await act(async () => {
      ctx.setIsWeatherSelected(true);
    });
    await act(async () => {
      ctx.processForm(validInputs, undefined);
    });
    expect(generateResponseAI.mock.calls[0][0]).toContain("Weather forecast for");
  });

  it("uses the plain prompt when weather is not selected", async () => {
    await submitWith();
    expect(generateResponseAI.mock.calls[0][0]).not.toContain("Weather forecast for");
  });
});
