#!/usr/bin/env node
// Computes the facts and the reading order for ONE change (layer 1).
// Deterministic: no model involved. The model adds the WHY afterwards
// through annotate.mjs, which checks every claim it makes against this file.
//
//   node tour.mjs <pr-number> [--repo owner/name] [--config path] [--out dir]
//   node tour.mjs --git main...feat/x [--title "..."] [--spec docs/specs/x.md]   (before a PR exists)
//   node tour.mjs --diff-file changes.diff [--title "..."] [--body-file notes.md] [--branch feat/x]
//
// Writes <out>/tour-<n>.json (default out: .pr-review).

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CONFIG_PATH, resolveRepo, parseArgs, loadConfig } from "./lib.mjs";
import { buildTour, writeReport, summarize } from "./build.mjs";

const args = parseArgs(process.argv.slice(2));
const configPath = args.config ?? CONFIG_PATH;
const cfg = loadConfig(configPath); // optional: without it, built-in defaults apply

let source;
if (args.git || args["diff-file"]) {
  source = {
    git: args.git,
    diffText: args["diff-file"] ? readFileSync(args["diff-file"], "utf8") : undefined,
    number: args.number, title: args.title, branch: args.branch, spec: args.spec,
    body: args["body-file"] ? readFileSync(args["body-file"], "utf8") : "",
  };
} else {
  if (!args._[0]) { console.error("usage: tour.mjs <pr-number> [--repo owner/name] | --git base...head | --diff-file x.diff"); process.exit(1); }
  source = { number: args._[0], repo: resolveRepo(args.repo), spec: args.spec };
}

let report;
try { report = buildTour(source, cfg, configPath); }
catch (e) { console.error(e.message); process.exit(1); }

const file = writeReport(args.out ?? ".pr-review", `tour-${report.pr.number}.json`, report);
const s = summarize(report);
console.log(file);
// Render right away, so the pages never lag behind the JSON.
execFileSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), "render.mjs"), file], { stdio: "inherit" });
console.log(`noise: ${s.noiseLines} lines in ${s.noiseFiles} files, collapsed`);
console.log(s.line);
for (const f of report.items.filter((x) => x.severity !== "low")) console.log(`  ${f.severity.padEnd(6)} ${f.file}${f.line ? ":" + f.line : ""}  ${f.text}`);
