import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/test/render";
import CountryComboBox from "@/components/form/CountryComboBox";


function renderCombo(value?: string) {
  const onSelect = vi.fn();
  renderWithProviders(
    <CountryComboBox label="Country" placeholder="Select a country" value={value} onSelect={onSelect} />,
  );
  return { onSelect };
}

describe("CountryComboBox", () => {
  it("filters the list by what is typed", async () => {
    // With `items` instead of `defaultItems`, and without `textValue`, every
    // country stayed in the list whatever was typed.
    const user = userEvent.setup();
    renderCombo();

    await user.type(screen.getByRole("combobox", { name: /country/i }), "Portu");

    const options = await screen.findAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["Portugal"]);
  });

  it("hands back the chosen country's code", async () => {
    const user = userEvent.setup();
    const { onSelect } = renderCombo();

    await user.type(screen.getByRole("combobox", { name: /country/i }), "Spa");
    await user.click(await screen.findByRole("option", { name: "Spain" }));

    expect(onSelect).toHaveBeenLastCalledWith("es");
  });

  // The label stops at 25 characters; the name past it must still be searchable.
  it("finds a long name by a word past its label's cut", async () => {
    const user = userEvent.setup();
    renderCombo();

    await user.type(screen.getByRole("combobox", { name: /country/i }), "Grenadines");

    const options = await screen.findAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["Saint Vincent and the Gre..."]);
  });

  it("shows a stored value as its label", () => {
    renderCombo("Portugal");

    expect(screen.getByRole("combobox", { name: /country/i })).toHaveValue("Portugal");
  });
});
