#!/usr/bin/env node
// The only door through which model-written text enters a report. It checks
// every claim against the deterministic facts and refuses what it cannot check.
// Source of truth: shared/annotate.mjs in github.com/dmoka/skills.
//
//   node annotate.mjs <report.json> <notes.json>
//
// Triage notes: { "summary": "...", "order": [<pr key>, ...] }   — most attention first;
//               the key is the PR number for one repo, "<repo slug>-<number>" for many
// Tour notes:   { "attention": { "level": "critical|high|medium|low", "whatHappened": "...", "why": "...",
//                                "file": "...", "line": 12, "code": "<fragment of that line>", "side": "new|old" },
//                 "whatItDoes": "...",
//                 "why": "<verbatim author words: the reason for the change>",
//                 "points": ["short line with a [keyword](src/file.ts:12) link", ...],
//                 "chapters": [{ "title": "...", "description": "...", "files": ["<path>", ...] }],
//                 "diagrams": [{ "title": "...", "kind": "sequence|flowchart|state|er|class", "mermaid": "...", "caption": "..." }],
//                 "changeMap": false,   (hide the computed change map when it adds nothing)
//                 "shape": [{ "title": "...", "kind": "call-tree|schema|types|pseudocode|component-tree|file-tree|contract", "lang": "diff|text|ts|sql|...", "code": "..." }],
//                 "claims": [{ "quote": "<verbatim from the PR text>", "file": "...", "line": 12, "code": "<fragment of that line>", "note": "..." }],
//                 "items":  [{ "severity": "high|medium|low", "file": "...", "line": 12, "code": "<fragment of that line>", "side": "new|old",
//                              "title": "...", "why": "..." }],
//                 "explains": [{ "quote": "<verbatim author words>", "files": ["<path>", ...] }],
//                 "fileNotes": { "<path>": "..." } }
// Exit 1 with a list of every problem; nothing is written unless all notes pass.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { readingOrder, stemOf, testsSource } from "./lib.mjs";
import { checkMermaid, DIAGRAM_KINDS } from "./diagrams.mjs";

const [reportPath, notesPath] = process.argv.slice(2);
if (!reportPath || !notesPath) { console.error("usage: annotate.mjs <report.json> <notes.json>"); process.exit(1); }
const report = JSON.parse(readFileSync(reportPath, "utf8"));
const notes = JSON.parse(readFileSync(notesPath, "utf8"));
const errors = [];
const warnings = []; // below the standard, but not wrong: printed, never blocking

// What these reports must never say. They point attention; they do not judge.
const VERDICT = /\b(LGTM|nothing to review|no need to review|safe to ignore|looks good|looks (?:safe|fine|correct|harmless)|(?:is|are|seems|seem) (?:safe|harmless)|safe to merge|ready to merge|approve[ds]?|good to go|ship it|no issues|nothing to worry|exploitable|is secure|verified safe)\b/i;
function checkText(where, text, { required = false, max = 600 } = {}) {
  if (text == null || text === "") { if (required) errors.push(`${where}: missing`); return; }
  if (typeof text !== "string") { errors.push(`${where}: must be a string`); return; }
  if (text.length > max) errors.push(`${where}: ${text.length} chars, max ${max} — say less`);
  const v = text.match(VERDICT);
  if (v) errors.push(`${where}: contains "${v[0]}" — this report points attention, it never gives a verdict`);
}

const LEVELS = ["critical", "high", "medium", "low"];

if (report.kind === "triage") {
  // The order is the model's; the gate checks it is complete and consistent
  // with the attention each PR's own judge gave it.
  // One queue may hold many repos: a PR is named by its key, not its number.
  checkText("summary", notes.summary, { max: 800 });
  const keyOf = (p) => String(p.key ?? p.number);
  const label = (k) => (/^\d+$/.test(k) ? `#${k}` : k);
  const order = (notes.order ?? []).map(String);
  const known = new Set(report.prs.map(keyOf));
  const seen = new Set();
  for (const n of order) {
    if (!known.has(n)) errors.push(`order: ${label(n)} is not an open PR in this report${report.repos ? ' — use the "key" of each PR in triage.json' : ""}`);
    if (seen.has(n)) errors.push(`order: ${label(n)} appears twice`);
    seen.add(n);
  }
  for (const n of known) if (!seen.has(n)) errors.push(`order: ${label(n)} is missing — every open PR gets a place`);
  const attentionOf = new Map();
  for (const p of report.prs) {
    const path = join(dirname(reportPath), p.tour);
    const tour = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
    if (!tour?.attention) errors.push(`${label(keyOf(p))}: ${p.tour} has no attention yet — judge it first (annotate the tour with an "attention" block)`);
    else attentionOf.set(keyOf(p), tour.attention);
  }
  let prev = 0;
  for (const n of order) {
    const a = attentionOf.get(n);
    if (!a) continue;
    const lvl = LEVELS.indexOf(a.level);
    if (lvl < prev) errors.push(`order: ${label(n)} is "${a.level}" but sits below a "${LEVELS[prev]}" PR — order by level first, then by your judgement within a level`);
    prev = Math.max(prev, lvl);
  }
  if (!errors.length) {
    report.summary = notes.summary ?? null;
    const rank = new Map(order.map((n, i) => [n, i + 1]));
    for (const p of report.prs) { p.attention = attentionOf.get(keyOf(p)); p.rank = rank.get(keyOf(p)); }
    report.prs.sort((a, b) => a.rank - b.rank);
  }
} else if (report.kind === "tour") {
  const files = new Map(report.files.map((f) => [f.path, f]));
  // A pointer is a file, a line, and a fragment of the code on that line. The
  // fragment catches the off-by-one that a bare line number cannot: in a new
  // file every line number is "in the diff".
  const ws = (s) => String(s).replace(/\s+/g, " ").trim();
  const lineIn = (path, line, side, code) => {
    const f = files.get(path);
    if (!f) return `file "${path}" is not in this diff`;
    if (line == null) return null;
    const key = side === "old" ? "o" : "n";
    const hit = f.hunks.flatMap((h) => h.lines).find((l) => l[key] === line && (side === "old" ? l.t !== "add" : l.t !== "del"));
    if (!hit) return `${path}:${line} is not a line of this diff on the ${side === "old" ? "old side (removed or context)" : "new side (added or context)"} — point inside a hunk`;
    if (!code || ws(code).length < 3) return `${path}:${line}: add "code" — a verbatim fragment (3+ chars) of that line, so the pointer can be checked`;
    if (!ws(hit.s).includes(ws(code))) return `${path}:${line} does not contain "${ws(code).slice(0, 50)}" — that line is: ${ws(hit.s).slice(0, 90)}`;
    return null;
  };
  // Verbatim means verbatim: only whitespace is normalised, case is not.
  const norm = (s) => ws(s);
  const quoteOk = (q) => ws(q).length >= 4 && intentText.includes(norm(q));
  const intentText = norm(report.intent.sources.map((s) => s.text).join("\n"));

  checkText("whatItDoes", notes.whatItDoes, { required: true, max: 600 });

  // Attention: how much of a reviewer's attention this change needs, and the
  // one line that drives the judgement. Optional for a standalone tour.
  const at = notes.attention;
  if (at) {
    if (!LEVELS.includes(at.level)) errors.push(`attention.level: must be one of ${LEVELS.join(", ")}`);
    checkText("attention.whatHappened", at.whatHappened, { required: true, max: 240 });
    checkText("attention.why", at.why, { required: true, max: 320 });
    if (at.file || at.level !== "low") {
      if (!at.file || at.line == null) errors.push(`attention: a "${at.level}" judgement needs "file", "line" and "code" — the line that drives it`);
      else { const e = lineIn(at.file, at.line, at.side, at.code); if (e) errors.push(`attention: ${e}`); }
    }
  }
  for (const [i, c] of (notes.claims ?? []).entries()) {
    if (!c.quote) { errors.push(`claims[${i}]: missing "quote"`); continue; }
    if (!quoteOk(c.quote)) errors.push(`claims[${i}]: "${c.quote.slice(0, 60)}" is not a verbatim quote (4+ chars, exact case) from the author's text`);
    if (c.file) { const e = lineIn(c.file, c.line, c.side, c.code); if (e) errors.push(`claims[${i}]: ${e}`); }
    checkText(`claims[${i}].note`, c.note, { max: 400 });
  }
  if (report.intent.status === "UNKNOWN" && (notes.claims ?? []).length) errors.push("claims: the PR states no intent, so there is nothing to quote — leave claims empty");

  // Intent map: which of the author's words explain which files.
  const needsReason = new Set(report.files.filter((f) => f.kind !== "noise").map((f) => f.path));
  for (const [i, e] of (notes.explains ?? []).entries()) {
    if (!e.quote) { errors.push(`explains[${i}]: missing "quote"`); continue; }
    if (!quoteOk(e.quote)) errors.push(`explains[${i}]: "${e.quote.slice(0, 60)}" is not a verbatim quote (4+ chars, exact case) from the author's text`);
    if (!Array.isArray(e.files)) { errors.push(`explains[${i}]: "files" must be an array (empty = stated but not in this diff)`); continue; }
    for (const p of e.files) {
      if (!files.has(p)) errors.push(`explains[${i}]: "${p}" is not in this diff`);
    }
  }
  if (report.intent.status !== "UNKNOWN" && needsReason.size && !(notes.explains ?? []).length) errors.push('explains: the author stated an intent, so map it — one entry per thing they say the PR does; use "files": [] for a quote with no matching change');
  if ((notes.items ?? []).length > 8) errors.push(`items: ${notes.items.length} LOOK HERE items, max 8 — keep the ones a reader must not miss`);
  for (const [i, it] of (notes.items ?? []).entries()) {
    if (!["high", "medium", "low"].includes(it.severity)) errors.push(`items[${i}]: severity must be high, medium or low`);
    if (!it.file) errors.push(`items[${i}]: every LOOK HERE item needs a "file"`);
    else if (it.line == null) errors.push(`items[${i}]: every LOOK HERE item needs a "line" — point at the exact place`);
    else { const e = lineIn(it.file, it.line, it.side, it.code); if (e) errors.push(`items[${i}]: ${e}`); }
    checkText(`items[${i}].title`, it.title, { required: true, max: 140 });
    checkText(`items[${i}].why`, it.why, { required: true, max: 500 });
  }
  for (const [path, text] of Object.entries(notes.fileNotes ?? {})) {
    if (!files.has(path)) errors.push(`fileNotes: "${path}" is not in this diff`);
    checkText(`fileNotes[${path}]`, text, { max: 700 });
    if (typeof text === "string" && text.length > 160 && !/\n\s*- /.test(text)) warnings.push(`fileNotes[${path}]: ${text.length} chars of prose — lead with a **bold takeaway**, then 2–5 "- " bullets`);
  }

  // Why: the author's own reason, quoted. Never the model's.
  if (notes.why != null) {
    if (!quoteOk(notes.why)) errors.push(`why: "${String(notes.why).slice(0, 60)}" is not a verbatim quote (4+ chars, exact case) from the author's text`);
    if (String(notes.why).length > 400) errors.push("why: max 400 chars — quote the one sentence that gives the reason");
  }

  // Overview points: short lines; every [keyword](path[:line]) link must land in the diff.
  const points = notes.points ?? [];
  if (points.length > 6) errors.push(`points: ${points.length} points, max 6`);
  for (const [i, pt] of points.entries()) {
    checkText(`points[${i}]`, pt, { required: true, max: 240 });
    // One level of parentheses inside a target: Next.js route groups like app/(public)/page.tsx.
    for (const m of String(pt).matchAll(/\[([^\]]+)\]\(((?:[^()]|\([^()]*\))+)\)/g)) {
      const [, , target] = m;
      const [path, line] = target.split(/:(\d+)$/);
      if (!files.has(path)) errors.push(`points[${i}]: link target "${target}" is not a file in this diff`);
      else if (line && !files.get(path).hunks.some((h) => h.lines.some((l) => l.n === Number(line) && l.t !== "del"))) errors.push(`points[${i}]: "${target}" is not a new-side line of this diff`);
    }
  }

  // Chapters: the walkthrough, in the order a reader should go. Every
  // non-noise file exactly once — except a test, which follows its code.
  const pairOf = new Map();
  for (const f of report.files) if (f.kind === "test") {
    const src = report.files.filter((c) => c.kind !== "test" && c.kind !== "noise" && testsSource(stemOf(f.path), stemOf(c.path)))
      .sort((a, b) => stemOf(b.path).length - stemOf(a.path).length)[0];
    if (src) pairOf.set(f.path, src.path);
  }
  const chapters = notes.chapters ?? [];
  if (chapters.length > 6) errors.push(`chapters: ${chapters.length} chapters, max 6`);
  if (chapters.length) {
    const placed = new Map();
    for (const [i, c] of chapters.entries()) {
      checkText(`chapters[${i}].title`, c.title, { required: true, max: 80 });
      checkText(`chapters[${i}].description`, c.description, { max: 240 });
      for (const p of c.files ?? []) {
        if (!files.has(p)) errors.push(`chapters[${i}]: "${p}" is not in this diff`);
        else if (files.get(p).kind === "noise") errors.push(`chapters[${i}]: "${p}" is noise — it stays in the collapsed noise section`);
        else if (placed.has(p)) errors.push(`chapters[${i}]: "${p}" is already in chapter ${placed.get(p) + 1}`);
        else placed.set(p, i);
      }
    }
    for (const f of report.files) {
      if (f.kind === "noise" || placed.has(f.path)) continue;
      if (f.kind === "test" && pairOf.has(f.path)) continue; // follows its code
      errors.push(`chapters: "${f.path}" is in no chapter — place every code file (and every test with no code file)`);
    }
  }

  // Diagrams: 0–2, only where flow or structure changes. Must have content and render.
  const diagrams = notes.diagrams ?? [];
  if (diagrams.length > 2) errors.push(`diagrams: ${diagrams.length} diagrams, max 2 — draw only where flow or structure changes`);
  for (const [i, d] of diagrams.entries()) {
    checkText(`diagrams[${i}].title`, d.title, { required: true, max: 80 });
    checkText(`diagrams[${i}].caption`, d.caption, { max: 240 });
    if (!Object.keys(DIAGRAM_KINDS).includes(d.kind)) errors.push(`diagrams[${i}].kind: one of ${Object.keys(DIAGRAM_KINDS).join(", ")}`);
    else { const e = checkMermaid(d.mermaid, d.kind); if (e) errors.push(`diagrams[${i}].mermaid: ${e}`); }
    const labels = [...String(d.mermaid ?? "").matchAll(/["\[(:]\s*([^"\]\n)]+)/g)].map((m) => m[1]).join(" ");
    const v = labels.match(VERDICT);
    if (v) errors.push(`diagrams[${i}]: contains "${v[0]}" — diagrams point attention too`);
  }
  if (notes.changeMap != null && typeof notes.changeMap !== "boolean") errors.push("changeMap: true or false");

  // Shape: 1–3 compact structural views, show-me style.
  const SHAPES = ["call-tree", "schema", "types", "pseudocode", "component-tree", "file-tree", "contract"];
  const shape = notes.shape ?? [];
  if (shape.length > 3) errors.push(`shape: ${shape.length} views, max 3 — pick the ones that explain the change`);
  for (const [i, v] of shape.entries()) {
    checkText(`shape[${i}].title`, v.title, { required: true, max: 80 });
    if (!SHAPES.includes(v.kind)) errors.push(`shape[${i}].kind: one of ${SHAPES.join(", ")}`);
    if (typeof v.code !== "string" || !v.code.trim()) errors.push(`shape[${i}].code: missing`);
    else if (v.code.split("\n").length > 30) errors.push(`shape[${i}].code: ${v.code.split("\n").length} lines, max 30 — show the shape, not the code`);
  }

  if (!errors.length) {
    report.whatItDoes = notes.whatItDoes;
    report.attention = at ? { level: at.level, whatHappened: at.whatHappened, why: at.why, file: at.file ?? null, line: at.line ?? null, side: at.side ?? "new", code: at.code ?? null } : null;
    report.claims = notes.claims ?? [];
    report.items = [
      ...report.items.filter((x) => x.source === "fact"),
      ...(notes.items ?? []).map((it) => ({ source: "model", kind: "look-here", severity: it.severity, file: it.file, line: it.line, side: it.side ?? "new", text: it.title, why: it.why })),
    ];
    report.fileNotes = notes.fileNotes ?? {};
    report.why = notes.why ?? null;
    report.diagrams = diagrams.map((d) => ({ title: d.title, kind: d.kind, mermaid: d.mermaid, caption: d.caption ?? null }));
    report.showChangeMap = notes.changeMap !== false;
    report.points = points;
    report.shape = shape.map((v) => ({ title: v.title, kind: v.kind, lang: v.lang ?? "text", code: v.code }));
    // Chapters with each unlisted test placed right after its code.
    report.chapters = chapters.map((c) => {
      const out = [];
      for (const p of c.files) {
        if (out.includes(p)) continue;
        out.push(p);
        for (const [t, src] of pairOf) if (src === p && !chapters.some((x) => x.files.includes(t))) out.push(t);
      }
      return { title: c.title, description: c.description ?? null, files: out };
    });
    report.explains = (notes.explains ?? []).map((e) => ({ quote: e.quote, files: e.files }));
    // Derived, not written by the model: a test counts as explained when the
    // code it pairs with is explained.
    const explained = new Set(report.explains.flatMap((e) => e.files));
    const pairs = new Map();
    for (const f of report.files) if (f.kind === "test") {
      const src = report.files.filter((c) => c.kind !== "test" && c.kind !== "noise" && testsSource(stemOf(f.path), stemOf(c.path)))
        .sort((a, b) => stemOf(b.path).length - stemOf(a.path).length)[0];
      if (src) pairs.set(f.path, src.path);
    }
    report.unexplained = [...needsReason].filter((p) => !explained.has(p) && !(pairs.has(p) && explained.has(pairs.get(p))));
    report.unmatched = report.explains.filter((e) => !e.files.length).map((e) => e.quote);
    const areaOf = new Map(report.files.map((f) => [f.path, f.areas]));
    for (const p of report.unexplained.filter((x) => !(pairs.has(x) && report.unexplained.includes(pairs.get(x))))) {
      report.items.push({ source: "map", kind: "unexplained", severity: areaOf.get(p)?.length ? "high" : "medium", file: p, line: null,
        text: report.intent.status === "UNKNOWN" ? "No stated intent covers this change — ask the author why it is here." : "Nothing the author wrote explains this change — ask why it is here." });
    }
    const asFiles = report.files.map((f) => ({ path: f.path, meta: { kind: f.kind, noise: f.noise, stem: stemOf(f.path) } }));
    const cfg = report.config?.readingOrder ? { tour: { readingOrder: report.config.readingOrder } } : null;
    report.order = readingOrder(asFiles, report.items, cfg);
  }
} else {
  errors.push(`unknown report kind "${report.kind}"`);
}

for (const w of warnings) console.error(`warn: ${w}`);
if (errors.length) {
  console.error(`annotate: ${errors.length} problem(s), nothing written:\n` + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(`annotated ${reportPath}`);
