"use client";
import { useFormData } from "@/hooks/useFormData";
import { Controller } from "react-hook-form";
import { TextField, Label, Input } from "@heroui/react";
import { FaPlus, FaXmark } from "react-icons/fa6";
import StepPanel from "./StepPanel";
import { items } from "./content";
import { field, fieldInput, fieldLabel, focusTriad, limePill } from "./styles";

function FormStep4() {
  const { currentStep, fields, control, append, remove } = useFormData();

  if (currentStep !== 3) return null;

  return (
    <StepPanel>
      {fields.length === 0 ? (
        <p className="text-lg text-sorbet-ink/70">{items.empty}</p>
      ) : (
        <ol className="flex max-w-xl flex-col gap-6">
          {fields.map((item, index) => (
            <li className="flex items-end gap-3" key={item.id}>
              <Controller
                control={control}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name={`requiredItems[${index}].item` as any}
                render={({ field: { ref, ...fieldProps } }) => (
                  <TextField {...fieldProps} className={field}>
                    <Label className={fieldLabel}>{items.label(index + 1)}</Label>
                    <Input ref={ref} className={fieldInput} />
                  </TextField>
                )}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={items.remove(index + 1)}
                className={`mb-1.5 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-sorbet-ink/10 text-sorbet-ink transition-colors hover:bg-sorbet-ink hover:text-sorbet-offwhite motion-reduce:transition-none ${focusTriad}`}
              >
                <FaXmark size={15} aria-hidden />
              </button>
            </li>
          ))}
        </ol>
      )}
      <button type="button" onClick={() => append({ item: "" })} className={`mt-8 ${limePill}`}>
        <FaPlus size={13} aria-hidden />
        {items.add}
      </button>
    </StepPanel>
  );
}

export default FormStep4;
