# OpenAI SDK v6 Migration

Upgrade the OpenAI SDK from v4 → v6 and modernize the AI integration in `src/app/api/openaiApi.ts`. Run `/deps-tailwind4` first.

## Install

```bash
npm install openai@latest
```

## Breaking changes in openaiApi.ts

### 1. Function calling → Structured Outputs

The current code uses the legacy `tools` + `tool_choice` pattern with a manually defined JSON schema. In SDK v5+, the preferred approach is `response_format` with `json_schema` (Structured Outputs), which is more reliable and doesn't require `tool_calls` parsing.

Current pattern to replace:
```ts
// OLD — remove this
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  tools: [{ type: "function", function: functionData }],
  tool_choice: { type: "function", function: { name: "tripData" } },
  ...
});
const data = response.choices?.[0].message.tool_calls?.[0]?.function.arguments ?? null;
const parsedData = JSON.parse(data ?? "");
```

New pattern using Structured Outputs:
```ts
// NEW
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "tripData",
      strict: true,
      schema: { /* same properties as before */ },
    },
  },
  ...
});
const data = response.choices?.[0].message.content ?? null;
const parsedData = JSON.parse(data ?? "");
```

### 2. Model — consider upgrading

The app is pinned to `gpt-4o`. Evaluate upgrading to `gpt-4o-mini` (cheaper, fast enough for this structured task) or `gpt-4.1` (better instruction following). Update the model string in `openaiApi.ts`.

### 3. SDK v5/v6 client changes

Check for any deprecated constructor options or method signatures. The `OpenAI` client instantiation should still work the same way, but verify.

### 4. Error handling

SDK v6 throws typed errors (`APIError`, `AuthenticationError`, etc.). Update the catch block in `fetchResponseAI` to handle these if needed.

## Files to modify

- `src/app/api/openaiApi.ts` — primary change
- `prompts/function.json` — update to match new schema format if kept as reference

## After updating

1. Run `npm run build`.
2. Do a full end-to-end test: submit the form and verify the AI response parses correctly into the trip page sections (title, description, objectsList, mustHave, tours, tip).
3. Check that the null-city guard (`if (parsedData.trip === null)`) still works.
4. Report all changes made.
