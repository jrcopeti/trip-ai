import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen, waitFor, within } from "@/test/render";
import { FormProvider } from "@/context/FormContext";
import { useFormData } from "@/hooks/useFormData";
import Form from "@/components/form/Form";
import { steps } from "@/data";
import { validInputs } from "@/test/fixtures";
import {
  buttons,
  destination,
  items,
  personal,
  progress,
  review,
  stepCopy,
} from "@/components/form/content";
import { LIMITS } from "@/lib/schema";
import type { FieldName, FormContextType } from "@/types";

vi.mock("@/hooks/useWeather", () => ({
  useWeather: () => ({ generateForecast: vi.fn(), forecastData: undefined }),
}));
vi.mock("@/hooks/useImage", () => ({
  useImage: () => ({ generateImage: vi.fn() }),
}));
vi.mock("@/hooks/useTripResponse", () => ({
  useTripResponse: () => ({
    generateResponseAI: vi.fn(),
    isPendingResponseAI: false,
    errorResponseAI: null,
  }),
}));
vi.mock("@/hooks/useGeoNames", () => ({
  useGeoNames: () => ({ isCityValid: true, isLoadingCityValid: false, message: "" }),
}));
vi.mock("@/hooks/useCountries", () => ({
  useCountries: () => ({
    countries: [
      { value: "Portugal", label: "Portugal", code: "pt", flagUrl: "https://flagcdn.com/pt.svg" },
      { value: "Brazilian", label: "Brazilian", code: "br", flagUrl: "https://flagcdn.com/br.svg" },
    ],
    isLoading: false,
  }),
}));
vi.mock("react-hot-toast", () => ({ default: { custom: vi.fn() } }));

let ctx: FormContextType;

function Probe() {
  ctx = useFormData();
  return null;
}

function renderForm() {
  return renderWithProviders(
    <FormProvider>
      <Probe />
      <Form />
    </FormProvider>,
  );
}

/** Fills the fields step `index` validates, straight into the form state. */
async function fillStep(index: number) {
  await act(async () => {
    (steps[index].fields as FieldName[]).forEach((field) => {
      ctx.setValue(field, validInputs[field] as string);
    });
  });
}

async function walkTo(target: number, user: ReturnType<typeof userEvent.setup>) {
  for (let i = 0; i < target; i++) {
    await fillStep(i);
    await user.click(screen.getByRole("button", { name: buttons.next }));
    await screen.findByRole("heading", { level: 1, name: stepCopy[i + 1].title });
  }
}

beforeEach(() => {
  // Only the clock: the schema's date refinements compare against "today".
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2030, 3, 1, 12, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Form", () => {
  it("opens on step 1 with its title as the page heading", () => {
    renderForm();

    expect(
      screen.getByRole("heading", { level: 1, name: stepCopy[0].title }),
    ).toBeInTheDocument();
    expect(screen.getByText(progress.step(1, 7))).toBeInTheDocument();
  });

  it("names its buttons, and Back is off on the first step", () => {
    renderForm();

    expect(screen.getByRole("button", { name: buttons.back })).toBeDisabled();
    expect(screen.getByRole("button", { name: buttons.next })).toBeEnabled();
    expect(screen.queryByRole("button", { name: buttons.submit })).not.toBeInTheDocument();
  });

  it("blocks a premature Next on step 1 and shows the schema's messages", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: buttons.next }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Who's going is required")).toBeInTheDocument();
    expect(screen.getByText("Pick at least one age range")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: stepCopy[0].title })).toBeInTheDocument();
  });

  it("asks for the passport without requiring it", () => {
    renderForm();

    const passport = screen.getByRole("combobox", { name: /passport/i });
    expect(passport).not.toBeRequired();
    expect(screen.getByText(personal.passport.description)).toBeInTheDocument();
  });

  it("takes several age ranges, as a family has", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByText("0–5"));
    await user.click(screen.getByText("35–64"));

    expect(screen.getByRole("checkbox", { name: "0–5" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "35–64" })).toBeChecked();
  });

  it("clears a field's message as soon as the field is fixed, and only that one", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: buttons.next }));
    await screen.findByText("Name is required");

    await user.type(screen.getByRole("textbox", { name: /^name/i }), "Ana");

    await waitFor(() => expect(screen.queryByText("Name is required")).not.toBeInTheDocument());
    expect(screen.getByText("Who's going is required")).toBeInTheDocument();
  });

  it("shows no message on a field before Next is pressed", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByRole("textbox", { name: /^name/i }), "Ana");
    await user.clear(screen.getByRole("textbox", { name: /^name/i }));

    expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
  });

  it("blocks a premature Next on step 3 with a message per question", async () => {
    const user = userEvent.setup();
    renderForm();
    await walkTo(2, user);

    await user.click(screen.getByRole("button", { name: buttons.next }));

    expect(await screen.findByText("Type of travel is required")).toBeInTheDocument();
    expect(screen.getByText("Accommodation is required")).toBeInTheDocument();
    expect(screen.getByText("Pace is required")).toBeInTheDocument();
    expect(screen.getByText("Budget is required")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: stepCopy[2].title })).toBeInTheDocument();
  });

  it("clears a question's message once a chip is chosen", async () => {
    const user = userEvent.setup();
    renderForm();
    await walkTo(2, user);
    await user.click(screen.getByRole("button", { name: buttons.next }));
    await screen.findByText("Type of travel is required");

    await user.click(screen.getByText("Cultural"));

    await waitFor(() =>
      expect(screen.queryByText("Type of travel is required")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Budget is required")).toBeInTheDocument();
  });

  it("marks a chosen chip as checked", async () => {
    const user = userEvent.setup();
    renderForm();
    await walkTo(2, user);

    await user.click(screen.getByText("Cultural"));

    expect(screen.getByRole("radio", { name: "Cultural" })).toBeChecked();
  });

  it("adds and removes required items by name", async () => {
    const user = userEvent.setup();
    renderForm();
    await walkTo(3, user);

    // The form starts with one empty row.
    expect(screen.getByRole("textbox", { name: items.label(1) })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: items.add }));
    expect(screen.getByRole("textbox", { name: items.label(2) })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: items.remove(2) }));
    expect(screen.queryByRole("textbox", { name: items.label(2) })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: items.remove(1) }));
    expect(screen.getByText(items.empty)).toBeInTheDocument();
  });

  it("adds the next item on Enter and moves focus to it", async () => {
    const user = userEvent.setup();
    renderForm();
    await walkTo(3, user);

    await user.type(screen.getByRole("textbox", { name: items.label(1) }), "Passport{Enter}");

    const second = await screen.findByRole("textbox", { name: items.label(2) });
    await waitFor(() => expect(second).toHaveFocus());
    expect(screen.getByRole("textbox", { name: items.label(1) })).toHaveValue("Passport");
    expect(screen.getByRole("heading", { level: 1, name: stepCopy[3].title })).toBeInTheDocument();
  });

  it("inserts the new item right after the one Enter was pressed in", async () => {
    const user = userEvent.setup();
    renderForm();
    await walkTo(3, user);
    await user.type(screen.getByRole("textbox", { name: items.label(1) }), "Passport");
    await user.click(screen.getByRole("button", { name: items.add }));
    await user.type(screen.getByRole("textbox", { name: items.label(2) }), "Charger");

    await user.type(screen.getByRole("textbox", { name: items.label(1) }), "{Enter}");

    await waitFor(() => expect(screen.getByRole("textbox", { name: items.label(2) })).toHaveFocus());
    expect(screen.getByRole("textbox", { name: items.label(2) })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: items.label(3) })).toHaveValue("Charger");
  });

  it(`stops offering to add once there are ${LIMITS.requiredItems} items`, async () => {
    const user = userEvent.setup();
    renderForm();
    await walkTo(3, user);

    for (let n = 2; n <= LIMITS.requiredItems; n++) {
      await user.click(screen.getByRole("button", { name: items.add }));
    }

    expect(screen.getByRole("textbox", { name: items.label(LIMITS.requiredItems) })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: items.add })).not.toBeInTheDocument();
    expect(screen.getByText(items.full(LIMITS.requiredItems))).toBeInTheDocument();
  });

  it("adds nothing on Enter in an empty item", async () => {
    const user = userEvent.setup();
    renderForm();
    await walkTo(3, user);

    await user.type(screen.getByRole("textbox", { name: items.label(1) }), "{Enter}");

    expect(screen.queryByRole("textbox", { name: items.label(2) })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: stepCopy[3].title })).toBeInTheDocument();
  });

  it("goes back a step and keeps what was entered", async () => {
    const user = userEvent.setup();
    renderForm();
    await walkTo(1, user);

    await user.click(screen.getByRole("button", { name: buttons.back }));

    expect(
      await screen.findByRole("heading", { level: 1, name: stepCopy[0].title }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /name/i })).toHaveValue(validInputs.userName);
  });

  it("asks for the country before the city", async () => {
    const user = userEvent.setup();
    renderForm();
    await walkTo(1, user);

    const country = screen.getByRole("combobox", { name: destination.country.label });
    const city = screen.getByRole("textbox", { name: destination.city.label });
    expect(country.compareDocumentPosition(city) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("disables the city, with a hint, until a country is chosen", async () => {
    const user = userEvent.setup();
    renderForm();
    await walkTo(1, user);

    const city = screen.getByRole("textbox", { name: destination.city.label });
    expect(city).toBeDisabled();
    expect(city).toHaveAccessibleDescription(destination.city.hint);

    await act(async () => {
      ctx.setValue("country", "Portugal");
    });

    expect(city).toBeEnabled();
    expect(screen.queryByText(destination.city.hint)).not.toBeInTheDocument();
  });

  it("reviews the entered values and holds Submit until the agreement", async () => {
    const user = userEvent.setup();
    renderForm();
    await walkTo(6, user);

    const list = document.querySelector("dl")!;
    expect(within(list).getByText(review.labels.destination)).toBeInTheDocument();
    expect(within(list).getByText("Lisbon, Portugal")).toBeInTheDocument();
    expect(within(list).getByText(validInputs.userName)).toBeInTheDocument();
    expect(within(list).getByText("Art, Food")).toBeInTheDocument();
    expect(within(list).getByText("Couple")).toBeInTheDocument();
    expect(within(list).getByText("18–34")).toBeInTheDocument();
    expect(within(list).getByText("Cultural")).toBeInTheDocument();
    expect(within(list).getByText("Balanced")).toBeInTheDocument();
    expect(within(list).getByText("Brazil")).toBeInTheDocument();

    const submit = screen.getByRole("button", { name: buttons.submit });
    expect(submit).toHaveAttribute("type", "submit");
    expect(screen.queryByRole("button", { name: buttons.next })).not.toBeInTheDocument();

    await user.click(screen.getByText(review.agreement));

    await waitFor(() => expect(submit).toBeEnabled());
  });
});
