import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Trip } from "@prisma/client";
import { act, renderWithProviders, screen, waitFor } from "@/test/render";
import { FormProvider } from "@/context/FormContext";
import Form from "@/components/form/Form";
import { getTripByUrl } from "@/db/actions";
import { writeFormDraft } from "@/lib/formDraft";
import { forgetOpenTrip, readOpenTrip, rememberOpenTrip } from "@/lib/openTrip";
import { generatedTripFixture, validInputs } from "@/test/fixtures";
import { buttons, openTrip, stepCopy } from "@/components/form/content";

// The real FormProvider, reopened on the review step from a draft; the row lookup is mocked.
vi.mock("@/db/actions", () => ({ getTripByUrl: vi.fn() }));
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

const mockLookup = vi.mocked(getTripByUrl);
const URL = "a1b2c3d4e5f6";
const row = (saved: boolean): Trip => ({ ...generatedTripFixture, tripUrl: URL, saved });

async function renderReviewStep() {
  writeFormDraft({ values: validInputs, step: 6, isWeatherSelected: false });
  renderWithProviders(
    <FormProvider>
      <Form />
    </FormProvider>,
  );
  await screen.findByRole("heading", { level: 1, name: stepCopy[6].title });
}

const submit = () => screen.getByRole("button", { name: buttons.submit });

beforeEach(() => {
  // `validInputs`' dates are in May 2030; only the clock is faked.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2030, 3, 1, 12, 0, 0));
  mockLookup.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the form, with this browser's last trip unanswered", () => {
  it("holds back Plan my trip, says why, and links to that trip", async () => {
    rememberOpenTrip(URL);
    mockLookup.mockResolvedValue(row(false));
    await renderReviewStep();

    await waitFor(() => expect(mockLookup).toHaveBeenCalledWith(URL));
    expect(submit()).toBeDisabled();
    expect(submit()).toHaveAccessibleDescription(`${openTrip.note} ${openTrip.view}`);
    expect(screen.getByRole("link", { name: openTrip.view })).toHaveAttribute("href", `/trips/${URL}`);
    expect(readOpenTrip()).toBe(URL);
  });

  // So the button never flashes on before the check says the trip is gone.
  it("holds it back until the check answers", async () => {
    rememberOpenTrip(URL);
    mockLookup.mockReturnValue(new Promise(() => {}));
    await renderReviewStep();

    expect(submit()).toBeDisabled();
    expect(screen.getByText(openTrip.note, { exact: false })).toBeInTheDocument();
  });

  it.each([
    ["no longer has a row", null],
    ["was saved since", row(true)],
  ])("lets the traveller plan when the stored trip %s, and forgets it", async (_, found) => {
    rememberOpenTrip(URL);
    mockLookup.mockResolvedValue(found);
    await renderReviewStep();

    await waitFor(() => expect(submit()).toBeEnabled());
    expect(screen.queryByText(openTrip.note, { exact: false })).toBeNull();
    expect(readOpenTrip()).toBeNull();
  });

  // Answered in another tab: the form there frees itself without a reload.
  it("lets the traveller plan once the trip is answered", async () => {
    rememberOpenTrip(URL);
    mockLookup.mockResolvedValue(row(false));
    await renderReviewStep();
    await waitFor(() => expect(mockLookup).toHaveBeenCalled());
    expect(submit()).toBeDisabled();

    act(() => forgetOpenTrip(URL));

    expect(submit()).toBeEnabled();
    expect(screen.queryByRole("link", { name: openTrip.view })).toBeNull();
  });

  it("checks nothing and blocks nothing when no trip is open", async () => {
    await renderReviewStep();

    await waitFor(() => expect(submit()).toBeEnabled());
    expect(mockLookup).not.toHaveBeenCalled();
    expect(screen.queryByText(openTrip.note, { exact: false })).toBeNull();
  });
});
