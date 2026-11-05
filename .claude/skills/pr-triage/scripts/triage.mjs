#!/usr/bin/env node
// Layer 1 for the whole open PR queue: builds a tour-<key>.json for every open
// PR (files, noise, FACT items, reading order, the author's words) and a
// triage.json that lists them. Deterministic, no model involved. The model
// then judges each PR's attention level and orders the queue; annotate.mjs
// checks both.
//
//   node triage.mjs [--repo owner/name] [--out dir] [--limit 100] [--config path]
//   node triage.mjs --clean-cache [<host>:<path>]
//
// One repo (no list, or --repo): the current GitHub repo; key = the PR number.
// Many repos: every entry of <home>/.config/pr-triage/repos.jsonc goes into ONE
// queue. The login check runs first and only "ready" repos are triaged; code
// is read from a cache per repo (cache.mjs), never from a checkout; key =
// <repo slug>-<number>. --limit applies per repo.
//
// Writes <out>/triage.json and <out>/tour-<key>.json (default out: .pr-review).
// Rerunning replaces them, model notes included — judge after the last run.

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { SCHEMA_VERSION, CONFIG_PATH, ghJson, resolveRepo, parseArgs, loadConfig, parseJsonc, normalizeConfig } from "./lib.mjs";
import { buildTour, writeReport, summarize } from "./build.mjs";
import { loadRepoList, parseRepoEntry, preflight, formatTable, firstLine } from "./repos.mjs";
import { adapterFor } from "./hosts.mjs";
import { syncCache, cleanCache, prRef } from "./cache.mjs";

const args = parseArgs(process.argv.slice(2));
const outDir = args.out ?? ".pr-review";
const limit = String(args.limit ?? 100);
const now = Date.now();

if (args["clean-cache"]) {
  const entry = args["clean-cache"] === true ? null : parseRepoEntry(args["clean-cache"]);
  if (entry?.error) { console.error(`${entry.id}: ${entry.error}`); process.exit(1); }
  let removed;
  try { removed = cleanCache({ entry }); }
  catch (e) { console.error(e.message); process.exit(1); } // a run holds it, or a path outside the cache
  const { target, existed } = removed;
  console.log(existed ? `removed ${target}` : `nothing to remove: ${target} does not exist`);
  process.exit(0);
}

let list;
try { list = args.repo ? null : loadRepoList(); }
catch (e) { console.error(e.message); process.exit(1); } // a broken list: one line, no stack
const queue = list ? triageMany(list) : triageOne();
if (!queue) process.exit(0);

const file = writeReport(outDir, "triage.json", {
  kind: "triage",
  schemaVersion: SCHEMA_VERSION,
  generatedAt: new Date(now).toISOString(),
  ...queue.head,
  ranking: "the model read every PR and judged how much attention it needs; each judgement points at the line that drives it",
  summary: null,
  // Files two or more open PRs of one repo change: merge order matters, and one may break the other.
  overlaps: queue.overlaps,
  prs: queue.prs,
});
console.log(file);
// Render right away, so the pages never lag behind the JSON.
execFileSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), "render.mjs"), file], { stdio: "inherit" });
console.log(`Next: judge each tour-<key>.json (attention + notes), then order the queue.`);

function triageOne() {
  const configPath = args.config ?? CONFIG_PATH;
  const cfg = loadConfig(configPath); // optional
  const repo = resolveRepo(args.repo);
  const open = ghJson(["pr", "list", "--state", "open", "--limit", limit, "--json", "number,createdAt,labels"], { repo });
  if (!open.length) { console.log(`${repo} has no open pull requests.`); return null; }
  removeStale(new Set(open.map((p) => String(p.number))));

  // Fetch every PR head once, up front: parallel judges fetching into one
  // checkout collide on refs. Judges then read with git show "origin/<head>:<path>".
  const heads = ghJson(["pr", "list", "--state", "open", "--limit", limit, "--json", "headRefName"], { repo }).map((p) => p.headRefName);
  try {
    execFileSync("git", ["fetch", "--quiet", "origin", ...heads.map((h) => `+refs/heads/${h}:refs/remotes/origin/${h}`)], { stdio: "pipe" });
    console.log(`fetched ${heads.length} PR heads into origin/<head>`);
  } catch (e) { console.error(`warn: could not fetch PR heads (${String(e.stderr || e.message).trim().split("\n")[0]}) — judges must fetch their own`); }

  const q = newQueue({ repo, config: { path: cfg ? configPath : null } });
  for (const { number, createdAt, labels } of open.sort((a, b) => a.number - b.number)) {
    let report;
    try { report = buildTour({ number, repo }, cfg, configPath); }
    catch (e) { console.error(`  #${number}: ${e.message}`); continue; }
    q.add(report, { key: String(number), createdAt, labels });
  }
  return q.done();
}

function triageMany({ path: listFile, repos: entries }) {
  console.log(`repo list: ${listFile}`);
  if (!entries.length) { console.log("The repo list is empty: add entries like \"github:owner/repo\"."); return null; }
  const rows = preflight(entries);
  console.log(formatTable(rows));
  const repos = [];
  const q = newQueue({ repo: null, repos, config: { list: listFile } });
  for (const row of rows) {
    const rec = { id: row.id, host: row.host, path: row.path, slug: row.slug, ready: row.ready, status: row.status, open: 0, skipped: [] };
    repos.push(rec);
    if (!row.ready) continue;
    try {
      const adapter = adapterFor(row);
      const info = adapter.info();
      const open = adapter.listOpen(Number(limit)).sort((a, b) => a.number - b.number);
      const cache = syncCache({ entry: row, info, prs: open, adapter });
      rec.open = open.length;
      rec.cache = cache.dir;
      console.log(`${row.id}: ${open.length} open PR${open.length === 1 ? "" : "s"} · cache ${cache.dir}`);
      // The repo's own tuning file, read from its default branch.
      const cfgText = cache.read(`refs/heads/${info.defaultBranch}`, CONFIG_PATH);
      const configPath = `${row.id}:${CONFIG_PATH}`;
      const cfg = cfgText ? normalizeConfig(parseJsonc(cfgText), configPath) : null;
      for (const meta of open) {
        if (cache.failed.has(meta.number)) { rec.skipped.push({ number: meta.number, reason: `could not fetch the PR head: ${cache.failed.get(meta.number)}` }); continue; }
        let report;
        try {
          report = buildTour({ meta, repo: row.path, host: row.host, readIssue: adapter.readIssue,
            cache: { gitDir: cache.dir, base: `refs/heads/${meta.baseRefName}`, head: prRef(meta.number) } }, cfg, configPath);
        } catch (e) { rec.skipped.push({ number: meta.number, reason: firstLine(e.message) }); continue; }
        q.add(report, { key: `${row.slug}-${meta.number}`, createdAt: meta.createdAt, labels: meta.labels, repo: { id: row.id, path: row.path, slug: row.slug } });
      }
    } catch (e) {
      rec.ready = false;
      rec.status = `error: ${firstLine(e.message)}`;
    }
    for (const s of rec.skipped) console.error(`  ${row.id} #${s.number}: ${s.reason}`);
    if (!rec.ready) console.error(`${row.id}: ${rec.status}`);
  }
  // Repos that were not triaged are listed at the top of the queue page.
  return q.done(true);
}

// Collects queue rows and the files each PR touches; writes each tour.
function newQueue(head) {
  const prs = [];
  const touches = new Map(); // "<repo>\0<path>" -> PR keys, to find PRs that collide
  const keys = new Set();
  return {
    add(report, { key, createdAt, labels, repo }) {
      writeReport(outDir, `tour-${key}.json`, report);
      keys.add(key);
      for (const f of report.files) for (const p of new Set([f.path, f.oldPath].filter(Boolean))) {
        const t = `${repo?.id ?? ""}\0${p}`;
        touches.set(t, [...(touches.get(t) ?? []), repo ? key : report.pr.number]);
      }
      const s = summarize(report);
      prs.push({
        key,
        ...(repo ? { repo: repo.path, repoId: repo.id } : {}),
        number: report.pr.number,
        title: report.pr.title,
        url: report.pr.url,
        author: report.pr.author,
        draft: report.pr.draft,
        labels: (labels ?? []).map((l) => l.name),
        ageDays: Math.floor((now - Date.parse(createdAt)) / 86400000),
        createdAt,
        additions: report.pr.additions,
        deletions: report.pr.deletions,
        filesChanged: report.files.length,
        readLines: s.readLines,
        noiseLines: s.noiseLines,
        noiseFiles: s.noiseFiles,
        intent: report.intent.status,
        highFacts: s.highFacts.map((f) => ({ file: f.file, line: f.line, side: f.side, text: f.text })),
        tour: `tour-${key}.json`,
        attention: null, // copied from the tour's annotated attention by annotate.mjs
        rank: null,      // set by annotate.mjs from the model's order
      });
      const label = repo ? `${repo.path}#${report.pr.number}` : `#${report.pr.number}`;
      console.log(`${label.padEnd(repo ? 28 : 5)} ${report.pr.title.slice(0, 56).padEnd(56)} read ${String(s.readLines).padStart(5)} · noise ${String(s.noiseLines).padStart(5)} · ${s.highFacts.length} high facts · intent ${report.intent.status}`);
    },
    done(many = false) {
      if (many) removeStale(keys);
      const overlaps = [...touches].filter(([, n]) => n.length > 1).map(([t, prs]) => {
        const [repoId, file] = t.split("\0");
        return many ? { file, repo: repoId, prs } : { file, prs };
      }).sort((a, b) => b.prs.length - a.prs.length || a.file.localeCompare(b.file));
      return { head, prs, overlaps };
    },
  };
}

// A rerun replaces the queue: pages and reports of PRs that are no longer open go.
function removeStale(openKeys) {
  if (!existsSync(outDir)) return;
  for (const f of readdirSync(outDir)) {
    const m = f.match(/^tour-(.+?)\.(json|html|notes\.json)$/);
    if (m && !openKeys.has(m[1])) rmSync(join(outDir, f));
  }
}
