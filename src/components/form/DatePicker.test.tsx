import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/test/render";
import DatePicker from "@/components/form/DatePicker";
import { dates } from "@/components/form/content";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2030, 3, 1, 12, 0, 0)); // 1 April 2030, local
});

afterEach(() => {
  vi.useRealTimers();
});

function renderPicker(props: Partial<React.ComponentProps<typeof DatePicker>> = {}) {
  const onChange = vi.fn();
  renderWithProviders(
    <DatePicker label="Start date" id="startDate" placeholder="When?" onChange={onChange} {...props} />,
  );
  return { onChange };
}

describe("DatePicker", () => {
  it("is one control, named by its label and what it shows", () => {
    renderPicker();

    const field = screen.getByRole("button", { name: /^start date/i });
    expect(field).toHaveAccessibleName("Start date When?");
    // HeroUI's trigger is the field itself: no button nested inside it.
    expect(field.querySelector("button")).toBeNull();
  });

  it("opens a calendar on click and selects a date", async () => {
    const user = userEvent.setup();
    const { onChange } = renderPicker();

    await user.click(screen.getByRole("button", { name: /^start date/i }));
    const day = await screen.findByRole("button", { name: /April 15th, 2030/i });
    await user.click(day);

    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = new Date(onChange.mock.calls[0][0]);
    expect([picked.getFullYear(), picked.getMonth(), picked.getDate()]).toEqual([2030, 3, 15]);
    expect(screen.getByRole("button", { name: /^start date/i })).toHaveAccessibleName(
      expect.stringMatching(/15/),
    );
  });

  it("keeps the date when the selected day is clicked again", async () => {
    const user = userEvent.setup();
    const { onChange } = renderPicker({ value: new Date(2030, 3, 15).toISOString() });

    await user.click(screen.getByRole("button", { name: /^start date/i }));
    await user.click(await screen.findByRole("button", { name: /April 15th, 2030/i }));

    // react-day-picker deselects a re-clicked day unless `required`, and
    // `dayjs(undefined)` is now — so the field used to become today.
    for (const [value] of onChange.mock.calls) {
      const picked = new Date(value);
      expect([picked.getFullYear(), picked.getMonth(), picked.getDate()]).toEqual([2030, 3, 15]);
    }
    expect(screen.getByRole("button", { name: /^start date/i })).toHaveAccessibleName(
      expect.stringMatching(/15/),
    );
  });

  it("marks the selected day and today on the cells its circles are styled from", async () => {
    const user = userEvent.setup();
    renderPicker({ value: new Date(2030, 3, 15).toISOString() });

    await user.click(screen.getByRole("button", { name: /^start date/i }));
    const selected = (await screen.findByRole("button", { name: /April 15th, 2030/i })).parentElement;
    const today = screen.getByRole("button", { name: /^Today, .*April 1st, 2030/i }).parentElement;

    expect(selected).toHaveAttribute("data-selected", "true");
    expect(selected).toHaveClass("group");
    expect(today).toHaveAttribute("data-today", "true");
    expect(today).not.toHaveAttribute("data-selected");
  });

  it("offers a separate clear button once a date is set", async () => {
    const user = userEvent.setup();
    const { onChange } = renderPicker({ value: new Date(2030, 3, 15).toISOString() });

    await user.click(screen.getByRole("button", { name: dates.clear("Start date") }));

    expect(onChange).toHaveBeenCalledWith("");
    expect(screen.queryByRole("button", { name: dates.clear("Start date") })).not.toBeInTheDocument();
  });

  it("clears in one click under react-hook-form, after mounting on a value set before it", async () => {
    // As step 5 does: ticking the weather box sets the dates, unticking mounts the pickers.
    function Harness() {
      const { control, setValue } = useForm({ defaultValues: { startDate: "" } });
      const [shown, setShown] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setValue("startDate", new Date(2030, 3, 1).toISOString());
              setShown(true);
            }}
          >
            show
          </button>
          {shown && (
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => <DatePicker {...field} label="Start date" id="startDate" placeholder="When?" />}
            />
          )}
        </>
      );
    }
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.click(screen.getByRole("button", { name: "show" }));
    await user.click(screen.getByRole("button", { name: /^start date/i }));
    await user.click(await screen.findByRole("button", { name: /April 15th, 2030/i }));
    await user.click(screen.getByRole("button", { name: dates.clear("Start date") }));

    expect(screen.getByRole("button", { name: /^start date/i })).toHaveAccessibleName("Start date When?");
    expect(screen.queryByRole("button", { name: dates.clear("Start date") })).not.toBeInTheDocument();
  });

  it("marks itself invalid when told to", () => {
    renderPicker({ invalid: true });

    expect(screen.getByRole("button", { name: /^start date/i })).toHaveAttribute("aria-invalid", "true");
  });
});
