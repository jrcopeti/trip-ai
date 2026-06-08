# Migrate from OpenAI to Anthropic API

Replace the OpenAI SDK with the Anthropic SDK (`@anthropic-ai/sdk`) in `src/app/api/openaiApi.ts`. Run `/deps-openai` first so you start from the Structured Outputs version of the file.

## Install / uninstall

```bash
npm install @anthropic-ai/sdk
npm uninstall openai
```

## Rewrite src/app/api/openaiApi.ts

The current file uses `openai.chat.completions.create` with `response_format: json_schema`. Replace it entirely with the Anthropic SDK using **tool use** to enforce structured output — the closest equivalent to OpenAI's Structured Outputs.

### Client setup

```ts
"use server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### Tool use pattern (replaces response_format: json_schema)

```ts
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 4096,
  system: systemInstructions,
  messages: [{ role: "user", content: prompt }],
  tools: [
    {
      name: "tripData",
      description: "...", // keep the same description as functionData.description
      input_schema: {
        type: "object",
        properties: { /* same properties as before */ },
        required: [...],
      },
    },
  ],
  tool_choice: { type: "tool", name: "tripData" },
});

// Extract structured data from tool use response
const toolUseBlock = response.content.find(
  (block) => block.type === "tool_use",
);
const parsedData = toolUseBlock?.input ?? null;
```

Note: with tool use + `tool_choice: { type: "tool", name: "tripData" }`, the model is forced to call the tool and return the schema — no `JSON.parse` needed since `block.input` is already a parsed object.

### Model choice

Default to `claude-sonnet-4-6` (fast, capable, cost-effective for this task). If the response quality needs to be higher, switch to `claude-opus-4-7`. For faster and cheaper runs, use `claude-haiku-4-5-20251001`.

### Add prompt caching

The `systemInstructions` string is long and static — add a cache control header to avoid re-tokenizing it on every call:

```ts
messages: [
  {
    role: "user",
    content: [
      {
        type: "text",
        text: prompt,
      },
    ],
  },
],
system: [
  {
    type: "text",
    text: systemInstructions,
    cache_control: { type: "ephemeral" },
  },
],
```

### Error handling

The Anthropic SDK throws typed errors. Update the catch block:

```ts
import Anthropic from "@anthropic-ai/sdk";

} catch (error: unknown) {
  if (error instanceof Anthropic.APIError) {
    console.error(`Anthropic API error ${error.status}:`, error.message);
  } else {
    console.error("Error:", error);
  }
  throw new Error("Error in generating response from AI");
}
```

### Null-city guard

The existing `if (parsedData.trip === null)` check was never reachable (the schema has no `trip` field). Keep it as-is for backward compatibility — it still won't fire, but it doesn't break anything.

## Files to modify

- `src/app/api/openaiApi.ts` — full rewrite (primary change)
- `CLAUDE.md` — replace `OPENAI_API_KEY` with `ANTHROPIC_API_KEY` in the Environment Variables section
- `.env.local` — add `ANTHROPIC_API_KEY=...` and remove or comment out `OPENAI_API_KEY`

## After updating

1. Run `npm run build` and fix any TypeScript errors.
2. Verify `.env.local` has `ANTHROPIC_API_KEY` set.
3. Start `npm run dev` and do a full end-to-end test: fill out all 7 form steps and submit. Confirm the trip page renders all sections — title, description, objectsList, mustHave, tours, tip.
4. Report all files changed and confirm the build passes.
