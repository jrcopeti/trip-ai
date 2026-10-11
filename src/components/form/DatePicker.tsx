"use client";
import { useEffect, useState } from "react";
import { useToggle } from "@/hooks/useToggle";
import { Popover } from "@heroui/react";
import { MdOutlineCalendarToday } from "react-icons/md";
import { FaXmark } from "react-icons/fa6";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";
import { formatDate } from "@/lib/utils";
import { dates } from "./content";
import { fieldLabel, focusTriad } from "./styles";

interface DatePickerProps {
  label: string;
  id: string;
  placeholder?: string;
  onChange?: (val?: string) => void;
  value?: string;
  onBlur?: () => void;
  name?: string;
  ref?: React.Ref<HTMLDivElement>;
  invalid?: boolean;
}

/** react-day-picker v9 themed through its own variables. */
const calendarTheme = {
  "--rdp-accent-color": "#302e2d",
  "--rdp-accent-background-color": "#e2f3a7",
  "--rdp-today-color": "#302e2d",
  "--rdp-day-height": "2.5rem",
  "--rdp-day-width": "2.5rem",
} as React.CSSProperties;

/**
 * A date field: a pill that opens a calendar in a white card. The clear button
 * is a sibling of the trigger, not inside it — a button inside a button is
 * neither valid nor reachable by keyboard.
 */
function DatePicker({ label, id, placeholder, onChange, value, ref, invalid }: DatePickerProps) {
  const [open, actions] = useToggle();
  const [date, setDate] = useState<string>();

  useEffect(() => {
    typeof value !== "undefined" && setDate(value);
  }, [value]);

  return (
    <div className="flex w-full flex-col gap-2">
      <span id={`${id}-label`} className={fieldLabel}>
        {label}
      </span>
      <div className="relative">
        <Popover isOpen={open} onOpenChange={actions.setVisible}>
          {/* The trigger *is* the field. HeroUI's `Popover.Trigger` renders its
              own `role="button"` element, so a `<button>` inside it would be a
              button in a button with two tab stops. */}
          <Popover.Trigger
            ref={ref}
            id={id}
            aria-labelledby={`${id}-label ${id}-value`}
            aria-invalid={invalid || undefined}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-full border bg-white py-3.5 pl-5 pr-14 text-left text-base text-sorbet-ink hover:border-sorbet-ink/35 ${invalid ? "border-sorbet-alert" : "border-sorbet-ink/15"} ${focusTriad}`}
          >
            <MdOutlineCalendarToday size={18} aria-hidden className="shrink-0 text-sorbet-ink/60" />
            <span id={`${id}-value`} className={`flex-1 truncate ${date ? "" : "text-sorbet-ink/45"}`}>
              {date ? formatDate(date, false) : placeholder}
            </span>
          </Popover.Trigger>
          <Popover.Content
            data-sorbet
            placement="bottom start"
            className="w-auto rounded-3xl border border-sorbet-ink/10 bg-white p-3 font-sorbet text-sorbet-ink shadow-[0_18px_40px_-24px_rgba(48,46,45,0.55)]"
          >
            <Popover.Dialog aria-label={label}>
              <DayPicker
                style={calendarTheme}
                classNames={{
                  day_button: "rounded-full cursor-pointer",
                  selected: "font-semibold",
                  today: "font-semibold",
                }}
                mode="single"
                selected={date ? dayjs(date).toDate() : undefined}
                onSelect={(_val) => {
                  const formattedDate = dayjs(_val).toISOString();
                  setDate(formattedDate);
                  onChange?.(formattedDate);
                  actions.onHidden();
                }}
                autoFocus
              />
            </Popover.Dialog>
          </Popover.Content>
        </Popover>

        {date && (
          <button
            type="button"
            aria-label={dates.clear(label)}
            onClick={() => {
              setDate("");
              onChange?.(undefined);
            }}
            className={`absolute right-3 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-sorbet-ink/10 text-sorbet-ink transition-colors hover:bg-sorbet-ink hover:text-sorbet-offwhite motion-reduce:transition-none ${focusTriad}`}
          >
            <FaXmark size={14} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

export default DatePicker;
