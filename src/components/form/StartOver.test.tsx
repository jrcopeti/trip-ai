import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import { FormProvider } from "@/context/FormContext";
import Form from "@/components/form/Form";
import { readFormDraft, writeFormDraft } from "@/lib/formDraft";
import { validInputs } from "@/test/fixtures";
import { buttons, destination, personal, progress, startOver, stepCopy } from "@/components/form/content";
import toast from "react-hot-toast";

vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));
vi.mock("@/hooks/useFormForecast", () => ({
  useFormForecast: () => ({ generateForecast: vi.fn(), forecastData: undefined }),
}));
vi.mock("@/hooks/useTripGeneration", () => ({
  generateTripKey: ["generateTrip"],
  useTripGeneration: () => ({ generateTrip: vi.fn(), isPending: false, error: null, reset: vi.fn() }),
}));
const { geoNames } = vi.hoisted(() => ({
  geoNames: vi.fn(() => ({ isCityValid: true, isLoadingCityValid: false, message: "", place: null })),
}));
vi.mock("@/hooks/useGeoNames", () => ({
  idleCityCheck: { isCityValid: false, isLoadingCityValid: false, message: "", place: null },
  useGeoNames: geoNames,
}));
vi.mock("@/hooks/useCountries", () => ({
  useCountries: () => ({
    countries: [
      { value: "Portugal", label: "Portugal", code: "pt", flagUrl: "https://flagcdn.com/pt.svg" },
    ],
    isLoading: false,
  }),
}));
vi.mock("react-hot-toast", () => ({ default: { custom: vi.fn() } }));

function renderForm() {
  return renderWithProviders(
    <FormProvider>
      <Form />
    </FormProvider>,
  );
}

const nameField = () => screen.getByRole("textbox", { name: new RegExp(personal.name.label) });
const startOverButton = () => screen.queryByRole("button", { name: startOver.button });

/** Step 3 of a draft, as leaving /form mid-fill would have saved it. */
const savedDraft = { values: validInputs, step: 2, isWeatherSelected: false };

beforeEach(() => {
  vi.mocked(toast.custom).mockClear();
  geoNames.mockClear();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2030, 3, 1, 12, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the form's draft", () => {
  it("opens on the saved step with the saved answers", async () => {
    writeFormDraft(savedDraft);
    const user = userEvent.setup();
    renderForm();

    expect(
      await screen.findByRole("heading", { level: 1, name: stepCopy[2].title }),
    ).toBeInTheDocument();
    expect(screen.getByText(progress.step(3, 7))).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: buttons.back }));
    await user.click(screen.getByRole("button", { name: buttons.back }));
    expect(nameField()).toHaveValue(validInputs.userName);
  });

  // The restored city is checked again once the provider mounts; its answer is step 2's to say.
  it("doesn't announce a found city on a later step", async () => {
    writeFormDraft(savedDraft);
    const view = renderForm();
    await screen.findByRole("heading", { level: 1, name: stepCopy[2].title });

    geoNames.mockReturnValue({
      isCityValid: true,
      isLoadingCityValid: false,
      message: "Found Lisbon, Portugal",
      place: null,
    });
    view.rerender(
      <FormProvider>
        <Form />
      </FormProvider>,
    );

    expect(toast.custom).not.toHaveBeenCalled();
  });

  // Next stays off while the check fails, so a failure says why on any step.
  it("still announces a failed city check on a later step", async () => {
    writeFormDraft(savedDraft);
    const view = renderForm();
    await screen.findByRole("heading", { level: 1, name: stepCopy[2].title });

    geoNames.mockReturnValue({
      isCityValid: false,
      isLoadingCityValid: false,
      message: destination.unavailable,
      place: null,
    });
    view.rerender(
      <FormProvider>
        <Form />
      </FormProvider>,
    );

    expect(toast.custom).toHaveBeenCalledTimes(1);
  });

  // Back the day after the start date: "Plan my trip" would be off with nothing saying why.
  it("reopens on the dates step, with its error, when the start date has passed", async () => {
    writeFormDraft({ ...savedDraft, step: 6 });
    vi.setSystemTime(new Date(2030, 4, 3, 12, 0, 0));
    renderForm();

    expect(
      await screen.findByRole("heading", { level: 1, name: stepCopy[4].title }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Start date cannot be in the past")).toBeInTheDocument();
  });

  // The weather plan starts now, as ticking the box does, so it never goes stale.
  it("moves a weather plan's dates to today", async () => {
    writeFormDraft({ ...savedDraft, step: 6, isWeatherSelected: true });
    vi.setSystemTime(new Date(2030, 4, 3, 12, 0, 0));
    renderForm();

    expect(
      await screen.findByRole("heading", { level: 1, name: stepCopy[6].title }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(readFormDraft()?.values.startDate).toBe(new Date(2030, 4, 3, 12, 0, 0).toISOString()),
    );
  });

  it("saves what is typed, and the step", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(nameField(), "Ana");

    await waitFor(() => expect(readFormDraft()?.values.userName).toBe("Ana"));
    expect(readFormDraft()?.step).toBe(0);
  });
});

describe("Start over", () => {
  it("isn't offered on an untouched step 1", () => {
    renderForm();
    expect(startOverButton()).not.toBeInTheDocument();
  });

  it("is offered once anything is filled in", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(nameField(), "A");

    expect(startOverButton()).toBeInTheDocument();
  });

  it("asks first, and cancelling keeps everything", async () => {
    writeFormDraft(savedDraft);
    const user = userEvent.setup();
    renderForm();
    await screen.findByRole("heading", { level: 1, name: stepCopy[2].title });

    await user.click(startOverButton()!);
    const dialog = await screen.findByRole("alertdialog", { name: startOver.heading });
    expect(dialog).toHaveTextContent(startOver.body);

    await user.click(screen.getByRole("button", { name: startOver.cancel }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.getByRole("heading", { level: 1, name: stepCopy[2].title })).toBeInTheDocument();
    expect(readFormDraft()).toEqual(savedDraft);
  });

  it("clears the form, goes back to step 1 and drops the draft on confirm", async () => {
    writeFormDraft(savedDraft);
    const user = userEvent.setup();
    renderForm();
    await screen.findByRole("heading", { level: 1, name: stepCopy[2].title });

    await user.click(startOverButton()!);
    await user.click(await screen.findByRole("button", { name: startOver.confirm }));

    expect(
      await screen.findByRole("heading", { level: 1, name: stepCopy[0].title }),
    ).toBeInTheDocument();
    expect(nameField()).toHaveValue("");
    await waitFor(() => expect(startOverButton()).not.toBeInTheDocument());
    // The button that opened the dialog went with the answers; focus goes to the first field.
    await waitFor(() => expect(nameField()).toHaveFocus());
    expect(readFormDraft()).toBeNull();
  });
});
