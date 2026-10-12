import { beforeEach, describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import { cleanup, screen, within } from "@/test/render";
import { renderGeneratedTrip, renderSavedTrip } from "@/test/trip";
import {
  LOCAL_IMAGES,
  makeForecastEntry,
  makeTrip,
  tripDataFixture,
  tripFixture,
  weatherFixture,
} from "@/test/fixtures";
import TitleSection from "./TitleSection";
import DescriptionSection from "./DescriptionSection";
import ToursSection from "./ToursSection";
import PackReadySection from "./PackReadySection";
import ObjectsSection from "./ObjectsSection";
import MustHaveSection from "./MustHaveSection";
import PhotoSection from "./PhotoSection";
import WeatherSection from "./WeatherSection";
import ForecastSection from "./ForecastSection";
import FormDetailsSection from "./FormDetailsSection";
import {
  details,
  forecast,
  mustHave,
  objects,
  packReady,
  title,
  weather,
} from "./content";
import type { ObjectsListType } from "@/types";

vi.mock("@/app/api/anthropicApi", () => ({ fetchResponseAI: vi.fn() }));
vi.mock("@/app/api/unsplashApi", () => ({ fetchTripImage: vi.fn() }));
vi.mock("@/app/api/openWeatherApi", () => ({ fetchWeather: vi.fn(), fetchForecast: vi.fn() }));
vi.mock("@/db/actions", () => ({ getSingleSavedTrip: vi.fn(), createTripInDB: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/stubs/next"));
vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

const generatedObjects = tripDataFixture.objectsList as ObjectsListType[];
const savedObjects = tripFixture.objectsList as ObjectsListType[];
const generatedTours = tripDataFixture.tours as string[];

describe("TitleSection", () => {
  it("captions the large polaroid with the generated trip's title, as the h1", () => {
    renderGeneratedTrip(<TitleSection />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(tripDataFixture.title!);
  });

  it("captions it with the saved trip's title on the saved route", async () => {
    renderSavedTrip(<TitleSection />, { row: makeTrip({ title: "A Week of Saved Light" }) });

    expect(
      await screen.findByRole("heading", { level: 1, name: "A Week of Saved Light" }),
    ).toBeInTheDocument();
  });

  it("opens with the kind of trip and its length, on both routes", async () => {
    // The fixtures: a cultural trip, 1 to 8 May — seven days.
    renderGeneratedTrip(<TitleSection />);
    expect(screen.getByText("A cultural trip · 7 days")).toBeInTheDocument();
    cleanup();

    renderSavedTrip(<TitleSection />, { row: makeTrip({ type: "adventure" }) });
    expect(await screen.findByText("An adventure trip · 7 days")).toBeInTheDocument();
  });

  it("counts a forecast trip's days from its real dates", async () => {
    renderSavedTrip(<TitleSection />, { row: makeTrip({ weatherForecast: "yes" }) });

    expect(await screen.findByText("A cultural trip · 7 days")).toBeInTheDocument();
  });

  it("puts the trip's first photo in the frame", async () => {
    renderSavedTrip(<TitleSection />);

    await screen.findByRole("heading", { level: 1, name: tripFixture.title! });
    // alt="" gives the photo the presentation role, so it is found by tag.
    expect(screen.getByRole("article").querySelector("img")).toHaveAttribute(
      "src",
      LOCAL_IMAGES[0],
    );
  });

  it("lists destination, dates and traveller", async () => {
    renderSavedTrip(<TitleSection />);

    const start = dayjs(tripFixture.startDate).format("DD.MM.YYYY");
    const end = dayjs(tripFixture.endDate).format("DD.MM.YYYY");
    expect(await screen.findByText("lisbon, Portugal")).toBeInTheDocument();
    expect(screen.getByText(`${start} – ${end}`)).toBeInTheDocument();
    expect(screen.getByText("ana")).toBeInTheDocument();
  });

  it("keeps a forecast trip's real dates and notes they followed the forecast", async () => {
    renderSavedTrip(<TitleSection />, { row: makeTrip({ weatherForecast: "yes" }) });

    const start = dayjs(tripFixture.startDate).format("DD.MM.YYYY");
    const end = dayjs(tripFixture.endDate).format("DD.MM.YYYY");
    await screen.findByText(title.byWeather);
    const dates = screen.getByText(title.dates, { selector: "dt" }).nextElementSibling;
    expect(dates).toHaveTextContent(`${start} – ${end}`);
    expect(dates).toHaveTextContent(title.byWeather);
  });

  it("adds no forecast note to a trip with chosen dates", async () => {
    renderSavedTrip(<TitleSection />);

    await screen.findByText("lisbon, Portugal");
    expect(screen.queryByText(title.byWeather)).not.toBeInTheDocument();
  });
});

describe("DescriptionSection", () => {
  it("renders the generated description beside the second photo", () => {
    const { container } = renderGeneratedTrip(<DescriptionSection />);

    expect(screen.getByText(tripDataFixture.description!)).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("src", LOCAL_IMAGES[1]);
  });

  it("renders the saved description", async () => {
    renderSavedTrip(<DescriptionSection />, { row: makeTrip({ description: "Saved words." }) });

    expect(await screen.findByText("Saved words.")).toBeInTheDocument();
  });
});

describe("ToursSection", () => {
  it("shows the generated trip's first tour", () => {
    renderGeneratedTrip(<ToursSection />);

    expect(screen.getByRole("group", { name: "1 of 3" })).toHaveTextContent(generatedTours[0]);
  });

  it("shows the saved trip's tours", async () => {
    renderSavedTrip(<ToursSection />, { row: makeTrip({ tours: ["Only this one."] }) });

    expect(await screen.findByRole("group")).toHaveTextContent("Only this one.");
  });
});

describe("PhotoSection", () => {
  it("shows the generated trip's third photo", () => {
    const { container } = renderGeneratedTrip(<PhotoSection />);

    expect(container.querySelector("img")).toHaveAttribute("src", LOCAL_IMAGES[2]);
  });

  it("shows the saved trip's third photo", async () => {
    const { container } = renderSavedTrip(<PhotoSection />, {
      row: makeTrip({ image3: "/saved/third.jpg" }),
    });

    await vi.waitFor(() =>
      expect(container.querySelector("img")).toHaveAttribute("src", "/saved/third.jpg"),
    );
  });
});

describe("PackReadySection", () => {
  it("gives the date range", async () => {
    renderSavedTrip(<PackReadySection />);

    const start = dayjs(tripFixture.startDate).format("DD.MM.YYYY");
    const end = dayjs(tripFixture.endDate).format("DD.MM.YYYY");
    expect(
      await screen.findByText(new RegExp(packReady.range(start, end))),
    ).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(packReady.byWeather))).not.toBeInTheDocument();
  });

  it("says the list is based on the weather when it is", async () => {
    renderSavedTrip(<PackReadySection />, { row: makeTrip({ weatherForecast: "yes" }) });

    expect(await screen.findByText(new RegExp(packReady.byWeather))).toBeInTheDocument();
  });

  it("names the section in its heading", () => {
    renderGeneratedTrip(<PackReadySection />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      packReady.heading.claim,
    );
  });
});

describe("ObjectsSection", () => {
  it("renders one card per object, with its quantity and why", () => {
    renderGeneratedTrip(<ObjectsSection />);

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(generatedObjects.length);
    generatedObjects.forEach((object, i) => {
      expect(within(items[i]).getByRole("heading", { level: 3 })).toHaveTextContent(object.item);
      expect(within(items[i]).getByText(objects.chip(object.quantity))).toBeInTheDocument();
      expect(within(items[i]).getByText(object.description)).toBeInTheDocument();
    });
  });

  it("gives neighbouring cards a different hover lean, eased with an overshoot", () => {
    renderGeneratedTrip(<ObjectsSection />);

    const cards = screen.getAllByRole("article");
    const lean = (el: HTMLElement) => el.className.match(/hover:-?rotate-\S+/)?.[0];
    expect(lean(cards[0])).toBeDefined();
    expect(lean(cards[0])).not.toBe(lean(cards[1]));
    expect(lean(cards[1])).not.toBe(lean(cards[2]));
    expect(cards[0].className).toContain("motion-reduce:transition-none");
  });

  it("renders the saved trip's list", async () => {
    renderSavedTrip(<ObjectsSection />);

    expect(await screen.findAllByRole("listitem")).toHaveLength(savedObjects.length);
  });
});

describe("MustHaveSection", () => {
  it("checks off the must-have items and the ones the traveller asked for", () => {
    renderGeneratedTrip(<MustHaveSection />);

    const mustList = screen.getByRole("heading", { name: mustHave.mustHave }).parentElement!;
    for (const item of tripDataFixture.mustHave) {
      expect(within(mustList).getByText(item)).toBeInTheDocument();
    }
    const requiredList = screen.getByRole("heading", { name: mustHave.required }).parentElement!;
    expect(within(requiredList).getByText("camera")).toBeInTheDocument();
    expect(within(requiredList).getByText("walking shoes")).toBeInTheDocument();
  });

  it("turns a sticker where the photo used to be, hidden from assistive tech", () => {
    const { container } = renderGeneratedTrip(<MustHaveSection />);

    const ring = screen.getAllByText(new RegExp(mustHave.badge), { exact: false })[0];
    expect(ring.closest("[aria-hidden]")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("gives neighbouring pills a different hover lean", () => {
    renderGeneratedTrip(<MustHaveSection />);

    const mustList = screen.getByRole("heading", { name: mustHave.mustHave }).parentElement!;
    const pills = within(mustList).getAllByRole("listitem");
    const lean = (el: HTMLElement) => el.className.match(/hover:-?rotate-\S+/)?.[0];
    expect(lean(pills[0])).toBeDefined();
    expect(lean(pills[0])).not.toBe(lean(pills[1]));
    expect(pills[0].className).toContain("motion-reduce:transition-none");
  });

  it("drops blank required items and says so when none are left", async () => {
    renderSavedTrip(<MustHaveSection />, { row: makeTrip({ requiredItems: [""] }) });

    expect(await screen.findByText(mustHave.noRequired)).toBeInTheDocument();
  });

  it("keeps the real items when blanks are mixed in", async () => {
    renderSavedTrip(<MustHaveSection />, { row: makeTrip({ requiredItems: ["", "hat"] }) });

    const requiredList = (
      await screen.findByRole("heading", { name: mustHave.required })
    ).parentElement!;
    expect(await within(requiredList).findAllByRole("listitem")).toHaveLength(1);
    expect(within(requiredList).getByText("hat")).toBeInTheDocument();
  });
});

describe("WeatherSection", () => {
  const generateWeather = vi.fn();

  beforeEach(() => {
    generateWeather.mockClear();
  });

  it("asks for the destination's weather", () => {
    renderGeneratedTrip(<WeatherSection />, { weather: { generateWeather } });

    expect(generateWeather).toHaveBeenCalledWith({ city: "lisbon", country: "Portugal" });
  });

  it("asks for the saved trip's destination on the saved route", async () => {
    renderSavedTrip(<WeatherSection />, {
      row: makeTrip({ city: "kyoto", country: "Japan" }),
      weather: { generateWeather },
    });

    await vi.waitFor(() =>
      expect(generateWeather).toHaveBeenCalledWith({ city: "kyoto", country: "Japan" }),
    );
  });

  it("renders temperatures in Celsius, the condition and the metrics", () => {
    renderGeneratedTrip(<WeatherSection />, {
      weather: { generateWeather, weatherData: weatherFixture },
    });

    expect(screen.getByText("lisbon, Portugal")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByText(weather.feelsLike(22))).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
    expect(screen.getByText("clear sky")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
    expect(screen.getByText("15 km/h")).toBeInTheDocument();
    // Sunrise and sunset in the destination's time zone (UTC+1 in the fixture).
    expect(screen.getByText("06:00")).toBeInTheDocument();
    expect(screen.getByText("20:00")).toBeInTheDocument();
  });

  it("hides the weather icon from assistive tech, the condition being in the text", () => {
    const { container } = renderGeneratedTrip(<WeatherSection />, {
      weather: { generateWeather, weatherData: weatherFixture },
    });

    const icon = container.querySelector("img");
    expect(icon).toHaveAttribute("alt", "");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the loader on the first render, before the request has started", () => {
    // The request starts in an effect, after the first render: no data, nothing
    // pending yet. This used to flash "not available" for a frame.
    renderGeneratedTrip(<WeatherSection />, { weather: { generateWeather } });

    expect(screen.getByRole("status", { name: weather.loading })).toBeInTheDocument();
    expect(screen.queryByText(weather.unavailable)).not.toBeInTheDocument();
  });

  it("says so only when the request failed", () => {
    renderGeneratedTrip(<WeatherSection />, {
      weather: { generateWeather, errorWeather: new Error("down") },
    });

    expect(screen.getByText(weather.unavailable)).toBeInTheDocument();
    expect(screen.queryByRole("status", { name: weather.loading })).not.toBeInTheDocument();
  });
});

describe("ForecastSection", () => {
  const generateDailyForecast = vi.fn();
  const days = [
    { ...makeForecastEntry(4), dailyForecastIconSrc: "/icons/clouds.png" },
    { ...makeForecastEntry(12), dailyForecastIconSrc: "/icons/clouds.png" },
  ];

  beforeEach(() => {
    generateDailyForecast.mockClear();
  });

  it("asks for the destination's forecast", () => {
    renderGeneratedTrip(<ForecastSection />, { weather: { generateDailyForecast } });

    expect(generateDailyForecast).toHaveBeenCalledWith({ city: "lisbon", country: "Portugal" });
  });

  it("renders a card per day with its weekday and temperature", () => {
    renderGeneratedTrip(<ForecastSection />, {
      weather: { generateDailyForecast, dailyForecastData: days },
    });

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    expect(
      within(cards[0]).getByRole("heading", { name: dayjs.unix(days[0].dt).format("dddd") }),
    ).toBeInTheDocument();
    // 290.15K + 4 for entry 4, + 12 for entry 12.
    expect(within(cards[0]).getByText("21")).toBeInTheDocument();
    expect(within(cards[1]).getByText("29")).toBeInTheDocument();
    expect(within(cards[0]).getByText("Clouds")).toBeInTheDocument();
  });

  it("shows the loader until the first forecast arrives", () => {
    renderGeneratedTrip(<ForecastSection />, { weather: { generateDailyForecast } });

    expect(screen.getByRole("status", { name: forecast.loading })).toBeInTheDocument();
    expect(screen.queryByText(forecast.unavailable)).not.toBeInTheDocument();
  });

  it("says so when the forecast came back with no days", () => {
    renderGeneratedTrip(<ForecastSection />, {
      weather: { generateDailyForecast, dailyForecastData: [] },
    });

    expect(screen.getByText(forecast.unavailable)).toBeInTheDocument();
  });

  it("says so when the request failed", () => {
    renderGeneratedTrip(<ForecastSection />, {
      weather: { generateDailyForecast, errorDailyForecast: new Error("down") },
    });

    expect(screen.getByText(forecast.unavailable)).toBeInTheDocument();
  });
});

describe("FormDetailsSection", () => {
  it("lists what the traveller entered as terms and values", async () => {
    renderSavedTrip(<FormDetailsSection />);
    await screen.findByText("Brazilian");

    const value = (label: string) => screen.getByText(label, { selector: "dt" }).nextElementSibling;

    expect(value(details.labels.destination)).toHaveTextContent("lisbon, Portugal");
    expect(value(details.labels.nationality)).toHaveTextContent("Brazilian");
    expect(value(details.labels.name)).toHaveTextContent("ana");
    expect(value(details.labels.type)).toHaveTextContent("cultural");
    expect(value(details.labels.luggage)).toHaveTextContent("carry-on");
    expect(value(details.labels.note)).toHaveTextContent("wants a day trip to sintra");
  });

  it("shows the interests as chips", async () => {
    renderSavedTrip(<FormDetailsSection />);
    await screen.findByText("Brazilian");

    const interests = screen.getByText(details.labels.interests, { selector: "dt" })
      .nextElementSibling as HTMLElement;
    expect(within(interests).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "art",
      "food",
    ]);
  });

  it("names the flag after the country", async () => {
    renderSavedTrip(<FormDetailsSection />);

    expect(await screen.findByRole("img", { name: details.flag("Portugal") })).toHaveAttribute(
      "src",
      tripFixture.flagUrl,
    );
  });

  it("says the duration follows the weather when it does", async () => {
    renderSavedTrip(<FormDetailsSection />, { row: makeTrip({ weatherForecast: "yes" }) });

    expect(await screen.findByText(details.byWeather)).toBeInTheDocument();
  });

  it("drops blank interests rather than rendering an empty chip", async () => {
    renderSavedTrip(<FormDetailsSection />, { row: makeTrip({ interests: [""] }) });
    await screen.findByText("Brazilian");

    const interests = screen.getByText(details.labels.interests, { selector: "dt" })
      .nextElementSibling as HTMLElement;
    expect(within(interests).queryAllByRole("listitem")).toHaveLength(0);
    expect(interests).toHaveTextContent(details.none);
  });

  it("renders the generated route's form data", () => {
    renderGeneratedTrip(<FormDetailsSection />);

    expect(screen.getByText("wants a day trip to sintra")).toBeInTheDocument();
  });
});

describe("title.kind", () => {
  it("uses an before a vowel and a before a consonant", () => {
    expect(title.kind("urban", 3)).toBe("An urban trip · 3 days");
    expect(title.kind("family", 3)).toBe("A family trip · 3 days");
  });

  it("does not say trip twice", () => {
    expect(title.kind("road trip", 10)).toBe("A road trip · 10 days");
  });

  it("calls a same-day or one-day trip 1 day", () => {
    expect(title.kind("solo", 0)).toBe("A solo trip · 1 day");
    expect(title.kind("solo", 1)).toBe("A solo trip · 1 day");
  });

  it("falls back to a trip when the type is missing", () => {
    expect(title.kind(undefined, 4)).toBe("A trip · 4 days");
    expect(title.kind("", 5)).toBe("A trip · 5 days");
  });

  it("lowercases the stored type", () => {
    expect(title.kind("Gastronomy", 2)).toBe("A gastronomy trip · 2 days");
  });
});
