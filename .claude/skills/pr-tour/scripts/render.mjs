#!/usr/bin/env node
// Packs the viewer (viewer/viewer.css + viewer/viewer.js) and the report data
// into ONE self-contained HTML file: no server, no build step, no network
// needed (Geist loads from Google Fonts when online, system fonts otherwise).
// The page adds no facts; it is a view of the JSON.
// Source of truth: shared/render.mjs in github.com/dmoka/skills.
//
//   node render.mjs .pr-review/triage.json   -> .pr-review/review.html (the queue + every tour)
//   node render.mjs .pr-review/tour-7.json   -> .pr-review/tour-7.html (one tour)

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib.mjs";
import { render as renderMermaid, changeMapMermaid } from "./diagrams.mjs";

const args = parseArgs(process.argv.slice(2));
const input = args._[0];
if (!input) { console.error("usage: render.mjs <triage.json | tour-<n>.json> [--out file.html]"); process.exit(1); }
const report = JSON.parse(readFileSync(input, "utf8"));
const dir = dirname(input);
const here = dirname(fileURLToPath(import.meta.url));
const viewer = (f) => readFileSync(join(here, "viewer", f), "utf8");

let data, outPath, title;
if (report.kind === "triage") {
  const tours = {};
  for (const p of report.prs) {
    const path = join(dir, p.tour);
    if (existsSync(path)) tours[p.key ?? p.number] = JSON.parse(readFileSync(path, "utf8"));
  }
  data = { triage: report, tours };
  outPath = args.out ?? join(dir, "review.html");
  title = `Triage · ${report.repo ?? `${report.repos?.length ?? 0} repos`}`;
  // One file now holds the queue and every tour; drop pages from older layouts.
  for (const f of readdirSync(dir)) if (/^(triage|tour-.+)\.html$/.test(f)) rmSync(join(dir, f));
} else if (report.kind === "tour") {
  data = { tours: { [report.pr.number]: report } };
  outPath = args.out ?? input.replace(/\.json$/, ".html");
  title = `#${report.pr.number} · ${report.pr.title}`;
} else { console.error(`unknown report kind "${report.kind}"`); process.exit(1); }

// Diagrams become SVG here, at pack time: readers get no diagram library.
for (const t of Object.values(data.tours)) {
  const sev = (p) => { const s = t.items.filter((x) => x.file === p).map((x) => x.severity); return s.includes("high") ? "high" : s.includes("medium") ? "medium" : null; };
  const safe = (src) => { try { return renderMermaid(src); } catch (e) { return null; } };
  t.diagramsSvg = (t.diagrams ?? []).map((d) => ({ ...d, svg: safe(d.mermaid) }));
  if (t.changeMap && t.showChangeMap !== false) {
    const cm = changeMapMermaid(t.changeMap, { severity: sev, unexplained: t.unexplained ?? [] });
    t.changeMapSvg = { svg: safe(cm.mermaid), links: cm.links, mermaid: cm.mermaid };
  }
}

// JSON inside <script>: escape what could end the tag or break the parser.
const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

writeFileSync(outPath, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="color-scheme" content="dark">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap">
<style>${viewer("viewer.css")}</style></head>
<body><div id="app"></div>
<noscript><div class="noscript">This page needs JavaScript to draw the review. The same data is in <code>${esc(input.split("/").pop())}</code> next to this file.</div></noscript>
<script type="application/json" id="data">${json}</script>
<script>${viewer("viewer.js")}</script>
</body></html>
`);
console.log(`${outPath}${report.kind === "triage" ? ` (queue + ${Object.keys(data.tours).length} tours)` : ""}`);
