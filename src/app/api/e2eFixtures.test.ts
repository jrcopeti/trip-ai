import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { forecastListFixture } from "@/test/fixtures";
import { forecastFixtureFromNow } from "./e2eFixtures";

describe("forecastFixtureFromNow", () => {
  const now = dayjs("2031-02-10T14:37:00Z");
  const moved = forecastFixtureFromNow(now);

  it("starts at the last three-hour mark, as a real forecast does", () => {
    expect(moved[0].dt).toBe(dayjs("2031-02-10T12:00:00Z").unix());
    expect(moved[0].dt_txt).toBe("2031-02-10 12:00:00");
  });

  it("keeps the fixture's readings and spacing", () => {
    expect(moved).toHaveLength(forecastListFixture.length);
    expect(moved[1].dt - moved[0].dt).toBe(3 * 3600);
    expect(moved.map((r) => r.main)).toEqual(forecastListFixture.map((r) => r.main));
  });
});
