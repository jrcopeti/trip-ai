"use client";
import { useFormFields, useFormSteps } from "@/hooks/useFormData";
import { Controller } from "react-hook-form";
import { TextField, Label, Input, FieldError } from "@heroui/react";
import { FaPlus, FaXmark } from "react-icons/fa6";
import { LIMITS } from "@/lib/schema";
import StepPanel from "./StepPanel";
import { items } from "./content";
import { field, fieldError, fieldInput, fieldLabel, focusTriad, limePill } from "./styles";

function FormStep4() {
  const { currentStep } = useFormSteps();
  const { fields, control, errors, append, insert, remove } = useFormFields();

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
                // Dotted, not `[${index}]`: RHF finds a row to focus by its
                // dotted path, so a bracketed name is never focused.
                name={`requiredItems.${index}.item`}
                render={({ field: { ref, ...fieldProps } }) => (
                  <TextField
                    {...fieldProps}
                    isInvalid={!!errors.requiredItems?.[index]?.item}
                    className={field}
                  >
                    <Label className={fieldLabel}>{items.label(index + 1)}</Label>
                    <Input
                      ref={ref}
                      // Enter adds the next item below and focuses it (RHF's
                      // `insert` focuses by default), as list inputs do. Left
                      // alone it would submit the form, which fails silently.
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
                        e.preventDefault();
                        if (fieldProps.value?.trim() && fields.length < LIMITS.requiredItems) {
                          insert(index + 1, { item: "" });
                        }
                      }}
                      maxLength={LIMITS.requiredItem}
                      className={fieldInput}
                    />
                    <FieldError className={fieldError}>
                      {errors.requiredItems?.[index]?.item?.message}
                    </FieldError>
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
      {fields.length < LIMITS.requiredItems ? (
        <button type="button" onClick={() => append({ item: "" })} className={`mt-8 ${limePill}`}>
          <FaPlus size={13} aria-hidden />
          {items.add}
        </button>
      ) : (
        <p className="mt-8 text-lg text-sorbet-ink/70">{items.full(LIMITS.requiredItems)}</p>
      )}
    </StepPanel>
  );
}

export default FormStep4;
