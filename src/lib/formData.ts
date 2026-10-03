import type { FinalDataTypes, Inputs } from "@/types";

/**
 * Bridges the two shapes the form data lives in: RHF holds `requiredItems` as
 * `{ item: string }[]` (useFieldArray needs objects), the DB and the AI prompt
 * want a flat `string[]`.
 *
 * Lives here rather than in `FormContext` so it is directly testable.
 */
export function transformInputsToFinalData(inputs: Inputs): FinalDataTypes {
  const transformedRequiredItems =
    inputs.requiredItems?.map((i) => i.item) ?? [];

  return {
    ...inputs,
    requiredItems: transformedRequiredItems,
    weatherForecast: inputs.weatherForecast || "",
  };
}
