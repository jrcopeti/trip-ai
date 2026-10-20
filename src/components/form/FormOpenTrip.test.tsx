import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { act, renderWithProviders, screen, waitFor } from "@/test/render";
import { FormProvider } from "@/context/FormContext";
import { useFormData } from "@/hooks/useFormData";
import Form from "@/components/form/Form";
import { isTripOpen } from "@/db/actions";
import { writeFormDraft } from "@/lib/formDraft";
import { forgetOpenTrip, readOpenTrip, rememberOpenTrip } from "@/lib/openTrip";
import { steps } from "@/data";
import { validInputs } from "@/test/fixtures";
import { buttons, openTrip, stepCopy } from "@/components/form/content";
import type { FieldName, FormContextType } from "@/types";

// The real FormProvider, on step 1 or reopened on the review step from a draft; the check is mocked.
vi.mock("@/db/actions", () => ({ isTripOpen: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("react-hot-toast", () => ({ default: { custom: vi.fn(), dismiss: vi.fn() } }));
vi.mock("@/hooks/useTripGeneration", () => ({
  useTripGeneration: () => ({ generateTrip: vi.fn(), cancel: vi.fn(), clearFailure: vi.fn() }),
  useGenerationState: <T,>(select: (state: { pending: null; trip: null; failure: null }) => T) =>
    select({ pending: null, trip: null, failure: null }),
}));
vi.mock("@/hooks/useGeoNames", () => ({
  idleCityCheck: { isCityValid: false, isLoadingCityValid: false, message: "", place: null },
  useGeoNames: () => ({ isCityValid: true, isLoadingCityValid: false, message: "", place: null }),
}));
vi.mock("@/hooks/useCountries", () => ({
  useCountries: () => ({ countries: [], isLoading: false }),
}));

const mockCheck = vi.mocked(isTripOpen);
const URL = "a1b2c3d4e5f6";
let ctx: FormContextType;

function Probe() {
  ctx = useFormData();
  return null;
}

async function renderForm({ onReview = false } = {}) {
  if (onReview) writeFormDraft({ values: validInputs, step: 6, isWeatherSelected: false });
  renderWithProviders(
    <FormProvider>
      <Probe />
      <Form />
    </FormProvider>,
  );
  const step = onReview ? 6 : 0;
  await screen.findByRole("heading", { level: 1, name: stepCopy[step].title });
}

const submit = () => screen.getByRole("button", { name: buttons.submit });
const notice = () => screen.queryByText(openTrip.note);
const view = () => screen.queryByRole("link", { name: openTrip.view });

beforeEach(() => {
  // `validInputs`' dates are in May 2030; only the clock is faked.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2030, 3, 1, 12, 0, 0));
  mockCheck.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the form, with this browser's last trip unanswered", () => {
  it("says so on step 1, with a View to that trip, and lets the traveller fill in the form", async () => {
    const user = userEvent.setup();
    rememberOpenTrip(URL);
    mockCheck.mockResolvedValue(true);
    await renderForm();

    await waitFor(() => expect(mockCheck).toHaveBeenCalledWith(URL));
    expect(notice()).toBeInTheDocument();
    expect(view()).toHaveAttribute("href", `/trips/${URL}`);

    await act(async () => {
      (steps[0].fields as FieldName[]).forEach((field) => {
        ctx.setValue(field, validInputs[field] as string);
      });
    });
    await user.click(screen.getByRole("button", { name: buttons.next }));
    await screen.findByRole("heading", { level: 1, name: stepCopy[1].title });
    expect(notice()).toBeInTheDocument();
  });

  it("holds back Plan my trip on the review step, described by the notice", async () => {
    rememberOpenTrip(URL);
    mockCheck.mockResolvedValue(true);
    await renderForm({ onReview: true });

    await waitFor(() => expect(mockCheck).toHaveBeenCalled());
    expect(submit()).toBeDisabled();
    expect(submit()).toHaveAccessibleDescription(openTrip.note);
    expect(readOpenTrip()).toBe(URL);
  });

  // So the button never flashes on before the check says the trip is gone.
  it("holds it back until the check answers", async () => {
    rememberOpenTrip(URL);
    mockCheck.mockReturnValue(new Promise(() => {}));
    await renderForm({ onReview: true });

    expect(submit()).toBeDisabled();
    expect(notice()).toBeInTheDocument();
  });

  it("lets the traveller plan when the stored trip is no longer open, and forgets it", async () => {
    rememberOpenTrip(URL);
    mockCheck.mockResolvedValue(false);
    await renderForm({ onReview: true });

    await waitFor(() => expect(submit()).toBeEnabled());
    expect(notice()).toBeNull();
    expect(readOpenTrip()).toBeNull();
  });

  // Answered in another tab: the form here frees itself without a reload.
  it("lets the traveller plan once the trip is answered", async () => {
    rememberOpenTrip(URL);
    mockCheck.mockResolvedValue(true);
    await renderForm({ onReview: true });
    await waitFor(() => expect(mockCheck).toHaveBeenCalled());
    expect(submit()).toBeDisabled();

    act(() => forgetOpenTrip(URL));

    expect(submit()).toBeEnabled();
    expect(notice()).toBeNull();
    expect(view()).toBeNull();
  });

  it("checks nothing and shows nothing when no trip is open", async () => {
    await renderForm({ onReview: true });

    await waitFor(() => expect(submit()).toBeEnabled());
    expect(mockCheck).not.toHaveBeenCalled();
    expect(notice()).toBeNull();
    expect(submit()).not.toHaveAttribute("aria-describedby");
  });
});
