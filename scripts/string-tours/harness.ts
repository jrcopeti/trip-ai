/**
 * Makes the production trip call N times per variant, writes no row, and keeps each raw input in
 * `scripts/string-tours/runs/` with its outcome, tokens and where a list sent as text breaks.
 * Every run is a paid call; `--dry` and `--print` call nothing. Usage: `PLAN.md`, 2m-b.
 */
// First: the prompt's imports reach the travel photos.
import "./stubImages";
import Anthropic from "@anthropic-ai/sdk";
import { loadEnvConfig } from "@next/env";
import { mkdirSync, appendFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { buildSystemPrompt, buildTripMessage } from "@/lib/agent/prompt";
import { TripDataSchema, parseListFields, submitTripTool } from "@/lib/agent/submitTrip";
import { validTripRequest } from "@/test/fixtures/formData";
import { lisbonPlace } from "@/test/fixtures/geoNames";

loadEnvConfig(process.cwd());

const LIST_FIELDS = ["tours", "objectsList", "mustHave"];

interface Variant {
  model: string;
  system: string;
  message: string;
  tool: Anthropic.Tool;
  /** Request settings beyond production's, which sends neither. */
  thinking?: Anthropic.ThinkingConfigParam;
  effort?: "low" | "medium" | "high";
}

type JsonSchema = { properties: Record<string, unknown>; required: string[] };

/** `submitTripTool` with its top-level fields in `order`. */
function reordered(order: string[]): Anthropic.Tool {
  const schema = submitTripTool.input_schema as unknown as JsonSchema;
  return {
    ...submitTripTool,
    input_schema: {
      ...submitTripTool.input_schema,
      properties: Object.fromEntries(order.map((key) => [key, schema.properties[key]])),
      required: order,
    },
  };
}

/** The tool with every "110 to 130 words" in its descriptions swapped for `words`. */
function tourLength(tool: Anthropic.Tool, words: string): Anthropic.Tool {
  return JSON.parse(JSON.stringify(tool).replaceAll("110 to 130 words", words));
}

const base: Variant = {
  model: "claude-sonnet-5-5",
  system: buildSystemPrompt(),
  message: buildTripMessage(validTripRequest, lisbonPlace, []),
  tool: submitTripTool,
};

/** `main`'s prompt, trip message and tool before 2m-a (`67a490e`), as that commit built them. */
const preTwoMA: Omit<Variant, "model"> = JSON.parse(
  readFileSync(path.join(process.cwd(), "scripts/string-tours/main-before-2m-a.json"), "utf8"),
);

/** `text` with each `[from, to]` replaced, once each; throws when a `from` is missing. */
function swap(text: string, pairs: [string, string][]) {
  return pairs.reduce((out, [from, to]) => {
    if (!out.includes(from)) throw new Error(`Not in the prompt: ${from.slice(0, 60)}`);
    return out.replace(from, to);
  }, text);
}

const LINE_BREAK = ", not the characters backslash and n";
const TODAY_ENTRY = base.system.slice(
  base.system.indexOf("  - When a passport is given and it is not"),
  base.system.indexOf("\n\nSeparate paragraphs"),
);
const TODAY_TOURS = base.system.slice(
  base.system.indexOf("## The tours\n"),
  base.system.indexOf("## The packing list"),
);

/** Each variant changes one thing against `baseline`, which is the branch's production call. */
const VARIANTS: Record<string, Variant> = {
  baseline: base,
  "main-order": {
    ...base,
    tool: reordered(["title", "objectsList", "mustHave", "description", "tours", "tip"]),
  },
  "strict-off": { ...base, tool: { ...submitTripTool, strict: false } },
  opus: { ...base, model: "claude-opus-5-5" },
  "no-quotes": {
    ...base,
    system: `${base.system}\n\nUse no double quotation marks inside any text you write; use single quotes if you need to quote.`,
  },
  "short-tours": {
    ...base,
    system: base.system.replaceAll("110 to 130 words", "60 to 80 words"),
    tool: tourLength(submitTripTool, "60 to 80 words"),
  },
  "pre-2m-a": { ...base, system: preTwoMA.system, message: preTwoMA.message, tool: preTwoMA.tool },
  // Today's prompt with thinking set on purpose, instead of left to adaptive thinking's default.
  "thinking-off": { ...base, thinking: { type: "between_tools" } },
  "effort-medium": { ...base, effort: "medium" },
  "effort-low": { ...base, effort: "low" },
  // Today's prompt for the travellers its entry rules ask nothing about.
  "no-passport": {
    ...base,
    message: buildTripMessage({ ...validTripRequest, passport: undefined }, lisbonPlace, []),
  },
  "home-passport": {
    ...base,
    message: buildTripMessage({ ...validTripRequest, passport: "Portugal" }, lisbonPlace, []),
  },
  // The three below are today's prompt with one 2m-a change put back as `67a490e` had it.
  "old-entry": {
    ...base,
    system: swap(base.system, [
      [
        TODAY_ENTRY,
        "  - When a passport is given, end the tip by reminding them to check the entry requirements for that passport with the destination's official sources before booking: visa, passport validity, and any forms to fill in ahead. Do not state the rules yourself, since they change. When no passport is given, leave this out.",
      ],
    ]),
  },
  "no-linebreak": {
    ...base,
    system: swap(base.system, [
      ["\n\nSeparate paragraphs with a real line break, not the characters backslash and n.", ""],
      ["one paragraph of 110 to 130 words, with no line breaks, saying", "one paragraph of 110 to 130 words, saying"],
    ]),
    tool: JSON.parse(
      JSON.stringify(submitTripTool)
        .replaceAll(`, separated by a real line break${LINE_BREAK}`, "")
        .replace(` No line break, and not the characters backslash and n.`, ""),
    ),
  },
  "tours-in-rest": {
    ...base,
    system: swap(base.system, [
      [
        "return five tours, a packing list with the must-haves, a title, a short description and a tip",
        "return a packing list, a short description, five tours and a tip",
      ],
      [TODAY_TOURS, ""],
      [
        "- Description: up to three short paragraphs on the feel of this trip.\n",
        "- Description: up to three short paragraphs on the feel of this trip.\n" +
          TODAY_TOURS.replace("## The tours\nExactly five", "- Tours: exactly five")
            .trimEnd()
            .replaceAll("\n- ", "\n  - ") +
          "\n",
      ],
    ]),
  },
};

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

/** Where a list sent as text breaks: the parse error, the tour it was in, and the text around it. */
function breakOf(text: string) {
  try {
    JSON.parse(text);
    return { parses: true as const };
  } catch (error) {
    const message = String(error);
    const position = Number(/position (\d+)/.exec(message)?.[1] ?? NaN);
    const at = Number.isNaN(position) ? text.length : position;
    return {
      parses: false as const,
      error: message,
      position: at,
      // The tour the break falls in, 1-based, counted by the titles written before it.
      tour: text.slice(0, at).split('"title"').length - 1,
      around: text.slice(Math.max(0, at - 120), at + 40),
    };
  }
}

type Outcome = "ok" | "parsed" | "broken" | "invalid" | "error";

async function run(client: Anthropic, name: string, variant: Variant) {
  const started = Date.now();
  try {
    const response = await client.messages
      .stream({
        model: variant.model,
        max_tokens: 16000,
        system: [{ type: "text", text: variant.system, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: variant.message }],
        tools: [variant.tool],
        tool_choice: { type: "auto" },
        ...(variant.thinking && { thinking: variant.thinking }),
        ...(variant.effort && { output_config: { effort: variant.effort } }),
      })
      .finalMessage();
    const ms = Date.now() - started;
    const call = response.content.find(
      (block): block is Anthropic.ToolUseBlock =>
        block.type === "tool_use" && block.name === variant.tool.name,
    );
    const base = { variant: name, ms, stop: response.stop_reason, usage: response.usage, id: response.id };
    if (!call) return { ...base, outcome: "error" as Outcome, note: "no tool call" };

    const raw = call.input as Record<string, unknown>;
    // The keys' order is the order the model wrote the fields in.
    const keyOrder = Object.keys(raw);
    const strings = Object.fromEntries(
      LIST_FIELDS.filter((field) => typeof raw[field] === "string").map((field) => [
        field,
        { length: (raw[field] as string).length, ...breakOf(raw[field] as string) },
      ]),
    );
    const { input } = parseListFields(raw);
    const valid = TripDataSchema.safeParse(input).success;
    const anyBroken = Object.values(strings).some((s) => !s.parses);
    const outcome: Outcome = anyBroken
      ? "broken"
      : !valid
        ? "invalid"
        : Object.keys(strings).length > 0
          ? "parsed"
          : "ok";
    return { ...base, outcome, keyOrder, strings, raw };
  } catch (error) {
    return { variant: name, ms: Date.now() - started, outcome: "error" as Outcome, note: String(error) };
  }
}

async function main() {
  const which = arg("variant") ?? "baseline";
  const runs = Number(arg("runs") ?? 15);
  const concurrency = Number(arg("concurrency") ?? 3);
  const names = which === "all" ? Object.keys(VARIANTS) : which.split(",");
  for (const name of names) if (!VARIANTS[name]) throw new Error(`No variant "${name}"`);

  if (process.argv.includes("--print")) {
    const v = VARIANTS[names[0]];
    console.log(`${v.system}\n\n--- tool ---\n${JSON.stringify(v.tool, null, 2)}`);
    return;
  }

  if (process.argv.includes("--dry")) {
    for (const name of names) {
      const v = VARIANTS[name];
      const props = Object.keys((v.tool.input_schema as unknown as JsonSchema).properties);
      console.log(`${name}: ${v.model}, strict ${v.tool.strict}, fields ${props.join(" ")}`);
      if (v.thinking || v.effort) console.log(`  thinking ${v.thinking?.type ?? "adaptive"}, effort ${v.effort ?? "high"}`);
      if (v.system !== base.system) console.log(`  system prompt differs from baseline`);
      if (v.message !== base.message) console.log(`  trip message differs from baseline`);
      const passport = v.message.split("\n").find((line) => line.includes("Passport"));
      if (v.message !== base.message) console.log(`  ${passport ?? "no passport line"}`);
    }
    console.log(`\n${names.length} variant(s) × ${runs} runs = ${names.length * runs} paid calls`);
    return;
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const dir = path.join(process.cwd(), "scripts/string-tours/runs");
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  const fileFor = (name: string) => path.join(dir, `${stamp}-${name}.jsonl`);
  // Every variant's file exists from the start, so each can be followed before its first run.
  for (const name of names) appendFileSync(fileFor(name), "");

  for (const name of names) {
    const file = fileFor(name);
    const results: Awaited<ReturnType<typeof run>>[] = [];
    let next = 0;
    await Promise.all(
      Array.from({ length: concurrency }, async () => {
        while (next < runs) {
          const i = next++;
          const result = await run(client, name, VARIANTS[name]);
          appendFileSync(file, `${JSON.stringify({ i, ...result })}\n`);
          results.push(result);
          console.log(`${name} #${i + 1}: ${result.outcome} (${Math.round(result.ms / 1000)}s)`);
        }
      }),
    );

    const count = (outcome: Outcome) => results.filter((r) => r.outcome === outcome).length;
    const output = results.map((r) => ("usage" in r && r.usage ? r.usage.output_tokens : 0));
    console.log(
      `\n${name}: ${count("broken")}/${runs} broken, ${count("parsed")} parsed, ${count("invalid")} invalid, ` +
        `${count("error")} errors, ${count("ok")} ok; ` +
        `mean ${Math.round(results.reduce((s, r) => s + r.ms, 0) / runs / 1000)}s, ` +
        `${Math.round(output.reduce((s, n) => s + n, 0) / runs)} output tokens\n  → ${file}\n`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
