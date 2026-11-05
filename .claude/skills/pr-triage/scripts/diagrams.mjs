// Diagrams: the deterministic change map (which changed files use which) and
// checks + rendering for the model's Mermaid diagrams. Rendering happens when
// the page is packed, so readers get plain SVG and no library.
// Source of truth: shared/diagrams.mjs in github.com/dmoka/skills.

import { renderMermaidSVG, parseMermaid } from "./vendor/beautiful-mermaid.mjs";

// Colours from the viewer's dark tokens, as hex for the SVG renderer.
export const THEME = { bg: "#19191c", fg: "#e9e9ec", accent: "#7aa7f0", muted: "#a0a0a8" };
const RED = "#f0706e", AMBER = "#e9b04a", DIM = "#6e6e76";

// ---------- imports ----------

// Import specifiers in one file's text: JS/TS import/export/require, Python from/import.
export function importsOf(text, path) {
  const specs = new Set();
  if (/\.(ts|tsx|js|jsx|mjs|cjs|vue|svelte)$/.test(path)) {
    for (const m of text.matchAll(/(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g)) specs.add(m[1] ?? m[2] ?? m[3] ?? m[4]);
  } else if (/\.py$/.test(path)) {
    for (const m of text.matchAll(/^\s*from\s+([\w.]+)\s+import|^\s*import\s+([\w.]+)/gm)) specs.add(m[1] ?? m[2]);
  }
  return [...specs];
}

const stripExt = (p) => p.replace(/\.(d\.ts|tsx?|jsx?|mjs|cjs|vue|svelte|py)$/, "");
function normalize(parts) {
  const out = [];
  for (const p of parts) { if (p === "..") out.pop(); else if (p && p !== ".") out.push(p); }
  return out.join("/");
}

// The changed file an import specifier points at, or null. Relative paths,
// "@/" or "~/" root aliases, and bare repo paths ("src/db/client") resolve;
// packages do not.
export function resolveImport(spec, fromPath, paths) {
  let target;
  if (spec.startsWith(".")) target = normalize([...fromPath.split("/").slice(0, -1), ...spec.split("/")]);
  else if (/^[@~]\//.test(spec)) target = spec.slice(2);
  else if (/^[\w-]+(\.[\w-]+)+$/.test(spec) && /\.py$/.test(fromPath)) target = spec.replace(/\./g, "/");
  else target = spec;
  const byStem = new Map(paths.map((p) => [stripExt(p), p]));
  return byStem.get(target) ?? byStem.get(`${target}/index`) ?? byStem.get(`${target}/__init__`) ?? null;
}

/**
 * files: [{ path, kind }], readText(path) -> string | null.
 * Returns { nodes: [{ path, layer }], edges: [{ from, to }] } — from uses to.
 */
export function buildChangeMap(files, readText, layerOf, max = 16) {
  let nodes = files.filter((f) => f.kind !== "noise").map((f) => ({ path: f.path, kind: f.kind, layer: layerOf(f.path) }));
  if (nodes.length > max) nodes = nodes.filter((n) => n.kind !== "test");
  if (nodes.length > max || nodes.length < 2) return null;
  const paths = nodes.map((n) => n.path);
  const edges = [];
  for (const n of nodes) {
    const text = readText(n.path);
    if (!text) continue;
    for (const spec of importsOf(text, n.path)) {
      const to = resolveImport(spec, n.path, paths);
      if (to && to !== n.path && !edges.some((e) => e.from === n.path && e.to === to)) edges.push({ from: n.path, to });
    }
  }
  // A map is worth a look only when it shows more than "this test uses its code".
  const isTest = (p) => nodes.find((n) => n.path === p)?.kind === "test";
  if (nodes.length < 3 || !edges.some((e) => !isTest(e.from) && !isTest(e.to))) return null;
  return { nodes: nodes.map(({ path, layer }) => ({ path, layer })), edges };
}

// Shortest path suffix that is unique among the nodes: "page.tsx" unless two
// files share it, then "admin/page.tsx".
export function uniqueLabels(paths) {
  const labels = new Map();
  for (const p of paths) {
    const parts = p.split("/");
    for (let k = 1; k <= parts.length; k++) {
      const s = parts.slice(-k).join("/");
      if (paths.filter((q) => q === s || q.endsWith("/" + s)).length === 1) { labels.set(p, s); break; }
    }
  }
  return labels;
}

// Mermaid for the change map, grouped by reading-order layer. Colour marks
// findings only (red = high, amber = medium), so it stays rare and means something.
export function changeMapMermaid(map, { severity = () => null, unexplained = [] } = {}) {
  const labels = uniqueLabels(map.nodes.map((n) => n.path));
  const id = new Map(map.nodes.map((n, i) => [n.path, `n${i}`]));
  const q = (s) => `"${String(s).replace(/"/g, "'")}"`;
  const lines = ["flowchart LR"];
  const layers = [...new Set(map.nodes.map((n) => n.layer))];
  layers.forEach((layer, li) => {
    lines.push(`  subgraph L${li}[${q(layer)}]`);
    for (const n of map.nodes.filter((x) => x.layer === layer)) lines.push(`    ${id.get(n.path)}[${q(labels.get(n.path))}]`);
    lines.push("  end");
  });
  for (const e of map.edges) lines.push(`  ${id.get(e.from)} --> ${id.get(e.to)}`);
  lines.push(`  classDef hot stroke:${RED},stroke-width:2px,color:${RED}`);
  lines.push(`  classDef warn stroke:${AMBER},stroke-width:1.5px,color:${AMBER}`);
  lines.push(`  classDef test stroke:${DIM},color:${THEME.muted}`);
  for (const n of map.nodes) {
    const s = severity(n.path);
    const cls = s === "high" ? "hot" : s === "medium" ? "warn" : /(^|\/)(tests?|__tests__|e2e)\/|\.(test|spec)\./.test(n.path) ? "test" : null;
    if (cls) lines.push(`  class ${id.get(n.path)} ${cls}`);
  }
  return { mermaid: lines.join("\n"), links: Object.fromEntries(map.nodes.map((n) => [labels.get(n.path), n.path])) };
}

// ---------- model diagrams ----------

export const DIAGRAM_KINDS = { flowchart: /^(flowchart|graph)\s+(TD|TB|BT|LR|RL)\b/, sequence: /^sequenceDiagram\b/, state: /^stateDiagram(-v2)?\b/, er: /^erDiagram\b/, class: /^classDiagram\b/ };

// Returns an error message, or null when the diagram has real content and renders.
export function checkMermaid(src, kind) {
  const text = String(src ?? "").trim();
  if (!text) return "missing";
  const lines = text.split("\n");
  if (lines.length > 40) return `${lines.length} lines, max 40 — a diagram shows the shape, not everything`;
  const head = lines[0].trim();
  const actual = Object.entries(DIAGRAM_KINDS).find(([, re]) => re.test(head))?.[0];
  if (!actual) return `first line "${head.slice(0, 40)}" is not a supported diagram (flowchart LR/TD, sequenceDiagram, stateDiagram-v2, erDiagram, classDiagram)`;
  if (kind && kind !== actual) return `kind is "${kind}" but the diagram is a ${actual}`;
  if (actual === "flowchart" || actual === "state") {
    let p;
    try { p = parseMermaid(text); } catch (e) { return `does not parse: ${e.message.split("\n")[0]}`; }
    // Nodes inside a subgraph are not top-level; the edge ends count them too.
    const nodes = new Set([...Object.keys(p.nodes ?? {}), ...(p.edges ?? []).flatMap((e) => [e.source, e.target])]).size;
    if (nodes < 2 || !(p.edges ?? []).length) return `parses to ${nodes} node(s) and ${(p.edges ?? []).length} edge(s) — check the syntax (quote labels with brackets or parentheses: A["label (x)"])`;
  }
  if (actual === "sequence" && !lines.slice(1).some((l) => /\S\s*(-{1,2}>>|-{1,2}>|-{1,2}[x)])\s*[^:]+:/.test(l))) return "no message found — write messages as A->>B: text";
  if (actual === "er" && !lines.slice(1).some((l) => /\w+\s*\{|\|\|--|\}o--|--o\{/.test(l))) return "no entity or relation found";
  let svg;
  try { svg = render(text); } catch (e) { return `does not render: ${e.message.split("\n")[0]}`; }
  if (!svg || svg.length < 300) return "renders empty";
  return null;
}

export function render(src) {
  // Drop the renderer's web-font import: the page already has its fonts, and
  // a diagram should never reach the network.
  return renderMermaidSVG(String(src), THEME).replace(/@import url\([^)]*\);?/g, "");
}
