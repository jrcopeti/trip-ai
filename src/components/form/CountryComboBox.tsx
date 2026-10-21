"use client";
import {
  ComboBox,
  Description,
  FieldError,
  IconChevronDown,
  Input,
  Label,
  ListBox,
  ListBoxItem,
} from "@heroui/react";
import { countries } from "@/data/countries";
import type { Country } from "@/types";
import { field, fieldError, fieldLabel } from "./styles";

type Props = {
  label: string;
  placeholder: string;
  /** The form's current value — a country name. */
  value: string | undefined;
  onSelect: (code: string | number | null) => void;
  error?: string;
  /** Defaults to true; the passport is the one optional country. */
  isRequired?: boolean;
  description?: string;
};

/**
 * A searchable country list, shared by the passport (step 1) and destination
 * country (step 2). The input group is the pill; the popover is a white card.
 */
function CountryComboBox({
  label,
  placeholder,
  value,
  onSelect,
  error,
  isRequired = true,
  description,
}: Props) {
  const selected = countries.find((c) => c.value === value);

  return (
    <ComboBox<Country>
      // `defaultItems`, not `items`: react-aria filters `defaultItems` by what
      // is typed, but treats `items` as already filtered — with `items` the
      // whole list showed whatever you typed. The key re-mounts when the form's
      // value changes from outside (a restored draft), so the defaults take effect.
      key={selected?.code ?? ""}
      defaultItems={countries}
      defaultValue={selected?.code}
      defaultInputValue={selected?.label}
      onChange={onSelect}
      isInvalid={!!error}
      isRequired={isRequired}
      // `group` so the input group can read the root's `data-invalid`.
      className={`group ${field}`}
    >
      <Label className={fieldLabel}>{label}</Label>
      <ComboBox.InputGroup className="flex w-full items-center rounded-full border border-sorbet-ink/15 bg-white pr-2 shadow-none hover:border-sorbet-ink/35 focus-within:border-sorbet-ink group-data-invalid:border-sorbet-alert has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-sorbet-ink">
        <Input
          placeholder={placeholder}
          className="w-full rounded-full border-0 bg-transparent px-5 py-3.5 text-base text-sorbet-ink shadow-none outline-none placeholder:text-sorbet-ink/45 focus:ring-0 sm:text-base"
        />
        <ComboBox.Trigger className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-sorbet-ink/60 hover:bg-sorbet-ink/5 hover:text-sorbet-ink">
          <IconChevronDown />
        </ComboBox.Trigger>
      </ComboBox.InputGroup>
      {description && (
        <Description className="text-sm text-sorbet-ink/70">{description}</Description>
      )}
      <FieldError className={fieldError}>{error}</FieldError>
      <ComboBox.Popover
        placement="bottom"
        className="rounded-3xl border border-sorbet-ink/10 bg-white p-2 shadow-[0_18px_40px_-24px_rgba(48,46,45,0.55)]"
      >
        <ListBox<Country> className="max-h-72 overflow-y-auto font-sorbet">
          {(country) => (
            <ListBoxItem
              id={country.code}
              // Explicit: HeroUI wraps the label with its own indicator, so
              // react-aria cannot read the text to filter on by itself. The full
              // name, as the label is cut at 25 characters.
              textValue={country.value}
              className="cursor-pointer rounded-full px-4 py-2 text-sm text-sorbet-ink data-focused:bg-sorbet-ink/5 data-selected:bg-sorbet-lime data-selected:font-semibold"
            >
              {country.label}
            </ListBoxItem>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

export default CountryComboBox;
