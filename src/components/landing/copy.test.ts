import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@babel/parser";
import type { Node } from "@babel/types";
import { describe, expect, it } from "vitest";

/**
 * The landing's words live in `content.ts` (design-notes, "Copy lives in
 * `content.ts`"). A source scan, since a render can't tell a literal from an import.
 */

// Attributes that carry copy or a link target, as opposed to styling.
const COPY_ATTRIBUTES = new Set(["label", "alt", "title", "aria-label", "caption", "href"]);
// Units stay beside their number, as on the trip pages.
const hasWords = (text: string) => /[A-Za-z]/.test(text.replace(/ºC/g, ""));

function literals(file: string): string[] {
  const source = parse(readFileSync(file, "utf8"), { sourceType: "module", plugins: ["jsx", "typescript"] });
  const found: string[] = [];

  const visit = (node: Node) => {
    if (node.type === "JSXText" && hasWords(node.value)) found.push(node.value.trim());
    if (
      node.type === "JSXAttribute" &&
      node.name.type === "JSXIdentifier" &&
      COPY_ATTRIBUTES.has(node.name.name) &&
      node.value?.type === "StringLiteral" &&
      hasWords(node.value.value)
    ) {
      found.push(`${node.name.name}="${node.value.value}"`);
    }
    if (
      node.type === "JSXExpressionContainer" &&
      node.expression.type === "StringLiteral" &&
      hasWords(node.expression.value)
    ) {
      found.push(node.expression.value);
    }
    // Every child node sits under a key of its parent, alone or in an array.
    for (const value of Object.values(node)) {
      for (const child of [value].flat()) {
        if (typeof child?.type === "string") visit(child);
      }
    }
  };
  visit(source.program);
  return found;
}

const dir = __dirname;
const components = readdirSync(dir).filter((name) => /\.tsx$/.test(name) && !/\.test\.tsx$/.test(name));

describe("landing copy", () => {
  it.each(components)("%s writes no copy inline", (name) => {
    expect(literals(join(dir, name))).toEqual([]);
  });
});

describe("tripTypes.heading", () => {
  // It names the count in words, so it goes stale whenever `types` changes.
  it("counts the trip types the pills show", async () => {
    const { tripTypes } = await import("./content");
    const { sortedTypes } = await import("@/data");
    const words = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen"];

    const named = tripTypes.heading.split(" ")[0].toLowerCase();
    expect(words.indexOf(named) + 10).toBe(sortedTypes.length);
  });
});
