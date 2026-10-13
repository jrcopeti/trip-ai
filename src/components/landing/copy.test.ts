import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
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
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node) && hasWords(node.text)) found.push(node.text.trim());
    if (
      ts.isJsxAttribute(node) &&
      COPY_ATTRIBUTES.has(node.name.getText(source)) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer) &&
      hasWords(node.initializer.text)
    ) {
      found.push(`${node.name.getText(source)}="${node.initializer.text}"`);
    }
    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      ts.isStringLiteral(node.expression) &&
      hasWords(node.expression.text)
    ) {
      found.push(node.expression.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

const dir = __dirname;
const components = readdirSync(dir).filter((name) => /\.tsx$/.test(name) && !/\.test\.tsx$/.test(name));

describe("landing copy", () => {
  it.each(components)("%s writes no copy inline", (name) => {
    expect(literals(join(dir, name))).toEqual([]);
  });
});
