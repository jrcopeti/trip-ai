import { describe, expect, it } from "vitest";
import { countries, passportCountries } from "@/data/countries";

describe("countries", () => {
  it("maps each entry to a value, label, code and flag url", () => {
    expect(countries.find((c) => c.code === "pt")).toEqual({
      value: "Portugal",
      label: "Portugal",
      code: "pt",
      flagUrl: "https://flagcdn.com/pt.svg",
    });
  });

  // In English order, whatever the runtime's locale: Swedish puts Å after Z.
  it("sorts by name in English order", () => {
    const names = countries.map((c) => c.value);
    expect(names.slice(0, 3)).toEqual(["Afghanistan", "Åland Islands", "Albania"]);
    expect(names.at(-1)).toBe("Zimbabwe");
  });

  it("drops US states, the EU and the UN, but keeps the UK's nations", () => {
    const codes = countries.map((c) => c.code);
    expect(codes.filter((code) => code.startsWith("us-"))).toEqual([]);
    expect(codes).not.toContain("eu");
    expect(codes).not.toContain("un");
    expect(codes).toEqual(expect.arrayContaining(["us", "gb", "gb-eng", "gb-sct", "gb-wls", "gb-nir"]));
  });

  // The combobox keys options by code, and the form stores the name.
  it("has no repeated name or code", () => {
    expect(new Set(countries.map((c) => c.code)).size).toBe(countries.length);
    expect(new Set(countries.map((c) => c.value)).size).toBe(countries.length);
  });

  it("truncates a label past 25 characters, leaving the value intact", () => {
    const long = countries.filter((c) => c.value.length > 25);
    expect(long.length).toBeGreaterThan(0);
    for (const country of long) {
      expect(country.label).toBe(`${country.value.slice(0, 25)}...`);
    }
    for (const country of countries.filter((c) => c.value.length <= 25)) {
      expect(country.label).toBe(country.value);
    }
  });
});

describe("passportCountries", () => {
  it("is the list without the UK's nations, the United Kingdom kept", () => {
    const codes = passportCountries.map((c) => c.code);
    expect(codes.filter((code) => code.startsWith("gb-"))).toEqual([]);
    expect(codes).toContain("gb");
    expect(passportCountries).toHaveLength(countries.length - 4);
  });
});
