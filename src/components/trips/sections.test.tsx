import { beforeEach, describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import { screen, within } from "@/test/render";
import { stubSrc } from "@/test/imageStub";
import { renderTripSection } from "@/test/trip";
import {
  LOCAL_IMAGES,
  generatedTripFixture,
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
import type { Trip } from "@prisma/client";

vi.mock("@/app/api/openWeatherApi", () => ({ fetchWeather: vi.fn(), fetchForecast: vi.fn() }));
vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

const generatedObjects = tripDataFixture.objectsList as ObjectsListType[];
const generatedTours = tripDataFixture.tours as { title: string; kind: string; description: string }[];
const place = ({ city, country, countryCode }: Trip) => ({ city, country, countryCode });

describe("TitleSection", () => {
  it("captions the large polaroid with the generated trip's title, as the h1", () => {
    renderTripSection(<TitleSection trip={generatedTripFixture} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(tripDataFixture.title!);
  });

  it("opens with the kind of trip and its length", () => {
    // The fixtures: 1 to 8 May — seven days.
    renderTripSection(<TitleSection trip={makeTrip({ type: "adventure" })} />);

    expect(screen.getByText("An adventure trip · 7 days")).toBeInTheDocument();
  });

  it("counts a forecast trip's days from its real dates", async () => {
    renderTripSection(<TitleSection trip={makeTrip({ byWeather: true })} />);

    expect(await screen.findByText("A cultural trip · 7 days")).toBeInTheDocument();
  });

  it("puts the trip's first photo in the frame", async () => {
    renderTripSection(<TitleSection trip={tripFixture} />);

    await screen.findByRole("heading", { level: 1, name: tripFixture.title! });
    // alt="" gives the photo the presentation role, so it is found by tag.
    expect(screen.getByRole("article").querySelector("img")).toHaveAttribute(
      "src",
      LOCAL_IMAGES[0],
    );
  });

  it("lists destination, dates and traveller", async () => {
    renderTripSection(<TitleSection trip={tripFixture} />);

    const start = dayjs(tripFixture.startDate).format("DD.MM.YYYY");
    const end = dayjs(tripFixture.endDate).format("DD.MM.YYYY");
    expect(await screen.findByText("lisbon, Portugal")).toBeInTheDocument();
    expect(screen.getByText(`${start} – ${end}`)).toBeInTheDocument();
    expect(screen.getByText("ana")).toBeInTheDocument();
  });

  it("keeps a forecast trip's real dates and notes they followed the forecast", async () => {
    renderTripSection(<TitleSection trip={makeTrip({ byWeather: true })} />);

    const start = dayjs(tripFixture.startDate).format("DD.MM.YYYY");
    const end = dayjs(tripFixture.endDate).format("DD.MM.YYYY");
    await screen.findByText(title.byWeather);
    const dates = screen.getByText(title.dates, { selector: "dt" }).nextElementSibling;
    expect(dates).toHaveTextContent(`${start} – ${end}`);
    expect(dates).toHaveTextContent(title.byWeather);
  });

  it("adds no forecast note to a trip with chosen dates", async () => {
    renderTripSection(<TitleSection trip={tripFixture} />);

    await screen.findByText("lisbon, Portugal");
    expect(screen.queryByText(title.byWeather)).not.toBeInTheDocument();
  });
});

describe("DescriptionSection", () => {
  it("renders the generated description beside the second photo", () => {
    const { container } = renderTripSection(<DescriptionSection trip={generatedTripFixture} />);

    expect(screen.getByText(tripDataFixture.description!)).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("src", LOCAL_IMAGES[1]);
  });

});

describe("ToursSection", () => {
  it("shows the generated trip's first tour, titled", () => {
    renderTripSection(<ToursSection trip={generatedTripFixture} />);

    const slide = screen.getByRole("group", { name: `1 of ${generatedTours.length}` });
    expect(slide).toHaveTextContent(generatedTours[0].description);
    expect(slide).toHaveTextContent(generatedTours[0].kind);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(generatedTours[0].title);
  });

  it("shows an older trip's plain-string tours", async () => {
    renderTripSection(<ToursSection trip={makeTrip({ tours: ["Only this one."] })} />);

    expect(await screen.findByRole("group")).toHaveTextContent("Only this one.");
  });
});

describe("PhotoSection", () => {
  it("shows the generated trip's third photo", () => {
    const { container } = renderTripSection(<PhotoSection trip={generatedTripFixture} />);

    expect(container.querySelector("img")).toHaveAttribute("src", LOCAL_IMAGES[2]);
  });

  it("falls back to a bundled photo when the search found fewer than three", () => {
    const { container } = renderTripSection(
      <PhotoSection trip={makeTrip({ tripImages: ["/a.jpg", "/b.jpg"] })} />,
    );

    expect(container.querySelector("img")).toHaveAttribute("src", stubSrc("3.jpg"));
  });
});

describe("PackReadySection", () => {
  it("gives the date range", async () => {
    renderTripSection(<PackReadySection trip={tripFixture} />);

    const start = dayjs(tripFixture.startDate).format("DD.MM.YYYY");
    const end = dayjs(tripFixture.endDate).format("DD.MM.YYYY");
    expect(
      await screen.findByText(new RegExp(packReady.range(start, end))),
    ).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(packReady.byWeather))).not.toBeInTheDocument();
  });

  it("says the list is based on the weather when it is", async () => {
    renderTripSection(<PackReadySection trip={makeTrip({ byWeather: true })} />);

    expect(await screen.findByText(new RegExp(packReady.byWeather))).toBeInTheDocument();
  });

  it("names the section in its heading", () => {
    renderTripSection(<PackReadySection trip={generatedTripFixture} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      packReady.heading.claim,
    );
  });
});

describe("ObjectsSection", () => {
  it("renders one card per object, with its quantity and why", () => {
    renderTripSection(<ObjectsSection trip={generatedTripFixture} />);

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(generatedObjects.length);
    generatedObjects.forEach((object, i) => {
      expect(within(items[i]).getByRole("heading", { level: 3 })).toHaveTextContent(object.item);
      expect(within(items[i]).getByText(objects.chip(object.quantity))).toBeInTheDocument();
      expect(within(items[i]).getByText(object.description)).toBeInTheDocument();
    });
  });

  it("gives neighbouring cards a different hover lean, eased with an overshoot", () => {
    renderTripSection(<ObjectsSection trip={generatedTripFixture} />);

    const cards = screen.getAllByRole("article");
    const lean = (el: HTMLElement) => el.className.match(/hover:-?rotate-\S+/)?.[0];
    expect(lean(cards[0])).toBeDefined();
    expect(lean(cards[0])).not.toBe(lean(cards[1]));
    expect(lean(cards[1])).not.toBe(lean(cards[2]));
    expect(cards[0].className).toContain("motion-reduce:transition-none");
  });

  it("renders nothing for a row with no list", () => {
    renderTripSection(<ObjectsSection trip={makeTrip({ objectsList: null })} />);

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});

describe("MustHaveSection", () => {
  it("checks off the must-have items and the ones the traveller asked for", () => {
    renderTripSection(<MustHaveSection trip={generatedTripFixture} />);

    const mustList = screen.getByRole("heading", { name: mustHave.mustHave }).parentElement!;
    for (const item of tripDataFixture.mustHave) {
      expect(within(mustList).getByText(item)).toBeInTheDocument();
    }
    const requiredList = screen.getByRole("heading", { name: mustHave.required }).parentElement!;
    expect(within(requiredList).getByText("camera")).toBeInTheDocument();
    expect(within(requiredList).getByText("walking shoes")).toBeInTheDocument();
  });

  it("turns a sticker where the photo used to be, hidden from assistive tech", () => {
    const { container } = renderTripSection(<MustHaveSection trip={generatedTripFixture} />);

    const ring = screen.getAllByText(new RegExp(mustHave.badge), { exact: false })[0];
    expect(ring.closest("[aria-hidden]")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("gives neighbouring pills a different hover lean", () => {
    renderTripSection(<MustHaveSection trip={generatedTripFixture} />);

    const mustList = screen.getByRole("heading", { name: mustHave.mustHave }).parentElement!;
    const pills = within(mustList).getAllByRole("listitem");
    const lean = (el: HTMLElement) => el.className.match(/hover:-?rotate-\S+/)?.[0];
    expect(lean(pills[0])).toBeDefined();
    expect(lean(pills[0])).not.toBe(lean(pills[1]));
    expect(pills[0].className).toContain("motion-reduce:transition-none");
  });

  it("drops blank required items and says so when none are left", async () => {
    renderTripSection(<MustHaveSection trip={makeTrip({ requiredItems: [""] })} />);

    expect(await screen.findByText(mustHave.noRequired)).toBeInTheDocument();
  });

  it("keeps the real items when blanks are mixed in", async () => {
    renderTripSection(<MustHaveSection trip={makeTrip({ requiredItems: ["", "hat"] })} />);

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
    renderTripSection(<WeatherSection {...place(generatedTripFixture)} />, { weather: { generateWeather } });

    expect(generateWeather).toHaveBeenCalledWith({ city: "lisbon", countryCode: "PT" });
  });

  it("renders temperatures in Celsius, the condition and the metrics", () => {
    renderTripSection(<WeatherSection {...place(generatedTripFixture)} />, {
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
    const { container } = renderTripSection(<WeatherSection {...place(generatedTripFixture)} />, {
      weather: { generateWeather, weatherData: weatherFixture },
    });

    const icon = container.querySelector("img");
    expect(icon).toHaveAttribute("alt", "");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the loader on the first render, before the request has started", () => {
    // The request starts in an effect, after the first render: no data, nothing
    // pending yet. This used to flash "not available" for a frame.
    renderTripSection(<WeatherSection {...place(generatedTripFixture)} />, { weather: { generateWeather } });

    expect(screen.getByRole("status", { name: weather.loading })).toBeInTheDocument();
    expect(screen.queryByText(weather.unavailable)).not.toBeInTheDocument();
  });

  it("says so only when the request failed", () => {
    renderTripSection(<WeatherSection {...place(generatedTripFixture)} />, {
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
    renderTripSection(<ForecastSection {...place(generatedTripFixture)} />, { weather: { generateDailyForecast } });

    expect(generateDailyForecast).toHaveBeenCalledWith({ city: "lisbon", countryCode: "PT" });
  });

  it("renders a card per day with its weekday and temperature", () => {
    renderTripSection(<ForecastSection {...place(generatedTripFixture)} />, {
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
    renderTripSection(<ForecastSection {...place(generatedTripFixture)} />, { weather: { generateDailyForecast } });

    expect(screen.getByRole("status", { name: forecast.loading })).toBeInTheDocument();
    expect(screen.queryByText(forecast.unavailable)).not.toBeInTheDocument();
  });

  it("says so when the forecast came back with no days", () => {
    renderTripSection(<ForecastSection {...place(generatedTripFixture)} />, {
      weather: { generateDailyForecast, dailyForecastData: [] },
    });

    expect(screen.getByText(forecast.unavailable)).toBeInTheDocument();
  });

  it("says so when the request failed", () => {
    renderTripSection(<ForecastSection {...place(generatedTripFixture)} />, {
      weather: { generateDailyForecast, errorDailyForecast: new Error("down") },
    });

    expect(screen.getByText(forecast.unavailable)).toBeInTheDocument();
  });
});

describe("FormDetailsSection", () => {
  const value = (label: string) => screen.getByText(label, { selector: "dt" }).nextElementSibling;

  it("lists what the traveller entered as terms and values, options by their label", async () => {
    renderTripSection(<FormDetailsSection trip={tripFixture} />);
    await screen.findByText("Couple");

    expect(value(details.labels.destination)).toHaveTextContent("lisbon, Portugal");
    expect(value(details.labels.passport)).toHaveTextContent("Brazil");
    expect(value(details.labels.name)).toHaveTextContent("ana");
    expect(value(details.labels.travellers)).toHaveTextContent("Couple");
    expect(value(details.labels.ageRanges)).toHaveTextContent("25–30");
    expect(value(details.labels.type)).toHaveTextContent("Cultural");
    expect(value(details.labels.pace)).toHaveTextContent("Balanced");
    expect(value(details.labels.luggage)).toHaveTextContent("carry-on");
    expect(value(details.labels.note)).toHaveTextContent("wants a day trip to sintra");
  });

  it("leaves out a passport the traveller didn't give", async () => {
    renderTripSection(<FormDetailsSection trip={makeTrip({ passport: null })} />);
    await screen.findByText("Couple");

    expect(screen.queryByText(details.labels.passport, { selector: "dt" })).toBeNull();
  });

  it("shows the interests as chips, by their label", async () => {
    renderTripSection(<FormDetailsSection trip={tripFixture} />);
    await screen.findByText("Couple");

    const interests = screen.getByText(details.labels.interests, { selector: "dt" })
      .nextElementSibling as HTMLElement;
    expect(within(interests).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Art",
      "Food",
    ]);
  });

  it("shows an interest no list offers any more as it was stored", async () => {
    renderTripSection(<FormDetailsSection trip={makeTrip({ interests: ["gardening"] })} />);

    expect(await screen.findByText("gardening")).toBeInTheDocument();
  });

  it("shows the flag for the row's country code, named after the country", async () => {
    renderTripSection(<FormDetailsSection trip={tripFixture} />);

    expect(await screen.findByRole("img", { name: details.flag("Portugal") })).toHaveAttribute(
      "src",
      "https://flagcdn.com/pt.svg",
    );
  });

  it("says the duration follows the weather when it does", async () => {
    renderTripSection(<FormDetailsSection trip={makeTrip({ byWeather: true })} />);

    expect(await screen.findByText(details.byWeather)).toBeInTheDocument();
  });

  it("drops blank interests rather than rendering an empty chip", async () => {
    renderTripSection(<FormDetailsSection trip={makeTrip({ interests: [""] })} />);
    await screen.findByText("Couple");

    const interests = screen.getByText(details.labels.interests, { selector: "dt" })
      .nextElementSibling as HTMLElement;
    expect(within(interests).queryAllByRole("listitem")).toHaveLength(0);
    expect(interests).toHaveTextContent(details.none);
  });
});

describe("title.kind", () => {
  it("uses an before a vowel and a before a consonant", () => {
    expect(title.kind("urban", 3)).toBe("An urban trip · 3 days");
    expect(title.kind("family", 3)).toBe("A family trip · 3 days");
  });

  it("does not say trip twice, nor after a city break", () => {
    expect(title.kind("road trip", 10)).toBe("A road trip · 10 days");
    expect(title.kind("city break", 3)).toBe("A city break · 3 days");
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
