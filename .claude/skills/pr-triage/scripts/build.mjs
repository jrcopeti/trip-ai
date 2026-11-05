// Builds the deterministic half of a tour (layer 1) for one change: files,
// noise, FACT items, reading order, and the author's words. No model involved.
// Used by pr-tour (one PR) and pr-triage (every open PR).
// Source of truth: shared/build.mjs in github.com/dmoka/skills.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  SCHEMA_VERSION, gh, ghJson, parseDiff, classifyAll, computeFacts, readingOrder, DEFAULT_READING_ORDER,
  isInformative, issueRefs, branchSlug, intentStatus, INTENT_RANK,
  matchAny,
} from "./lib.mjs";
import { buildChangeMap } from "./diagrams.mjs";

export const ORDER_RULE = "hotspots (any high-severity item) first, then by layer (alphabetical within a layer); each test right after the code it tests; tests with no changed source next; noise collapsed last";

// gitDir: read a bare repo (pr-triage's cache for many repos) instead of the current one.
function git(a, gitDir) {
  const args = gitDir ? ["--git-dir", gitDir, ...a] : a;
  try { return execFileSync("git", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }); }
  catch (e) { throw new Error(`git ${a.join(" ")} failed: ${(e.stderr || e.message).toString().trim()}`); }
}

const gitLog = (base, head, gitDir) => git(["log", `${base}..${head}`, "--format=%s%x1f%b%x1e"], gitDir).split("\x1e").map((c) => c.trim()).filter(Boolean)
  .map((c) => { const [subject, body = ""] = c.split("\x1f"); return { subject: subject.trim(), body: body.trim() }; });

/**
 * source: { number, repo }                                  — an open PR, through gh
 *       | { meta, cache: { gitDir, base, head }, repo, host, readIssue }
 *                                                           — an open PR of a listed repo (pr-triage, many
 *                                                             repos): the host's PR text, code from the cache
 *       | { git: "main...feat/x", title?, body?, spec? }    — a local branch
 *       | { diffText, title?, body?, branch?, spec? }        — a saved diff
 */
export function buildTour(source, cfg, configPath) {
  let pr;
  let diffText;
  let commits = [];
  const repo = source.repo ?? null;
  const gitDir = source.cache?.gitDir;

  if (source.cache) {
    const { base, head } = source.cache;
    pr = source.meta;
    diffText = git(["-c", "core.quotePath=false", "diff", "--no-color", "--no-ext-diff", "-M", `${base}...${head}`], gitDir);
    commits = gitLog(base, head, gitDir);
  } else if (source.number != null && repo) {
    pr = ghJson(["pr", "view", String(source.number), "--json", "number,title,body,author,url,baseRefName,headRefName,headRefOid,createdAt,isDraft,closingIssuesReferences,commits"], { repo });
    commits = (pr.commits ?? []).map((c) => ({ subject: (c.messageHeadline || "").trim(), body: (c.messageBody || "").trim() }));
    diffText = gh(["pr", "diff", String(source.number)], { repo });
  } else {
    const range = source.git;
    const [base, head] = range ? range.split(/\.{2,3}/) : [null, source.branch ?? null];
    diffText = range ? git(["diff", range]) : source.diffText;
    if (range) commits = gitLog(base, head);
    pr = {
      // Local runs are named after the branch, so two branches never overwrite each other.
      number: source.number ?? (branchSlug(head) || "local"),
      title: source.title ?? "", body: source.body ?? "",
      author: null, url: null, baseRefName: base, headRefName: head, createdAt: null, isDraft: false, closingIssuesReferences: [],
    };
  }

  // The author's intent, in the author's words only, strongest source first.
  const sources = [];
  const add = (type, label, text) => { if (text && text.trim()) sources.push({ type, source: label, text: text.trim().slice(0, 20000) }); };

  // 1. A spec or review contract: given, else a markdown file in a spec folder
  //    whose name contains the branch name.
  const specPaths = [].concat(source.spec ?? []);
  const slug = branchSlug(pr.headRefName);
  if (!specPaths.length && slug.length >= 4) {
    const dirs = cfg?.tour?.specDirs ?? ["docs", "specs", ".scratch", "contracts"];
    // From the cache, the spec folders are read at the PR head.
    const candidates = source.cache
      ? git(["ls-tree", "-r", "--name-only", source.cache.head, "--", ...dirs], gitDir).split("\n").filter(Boolean)
      : dirs.filter((dir) => existsSync(dir)).flatMap((dir) => readdirSync(dir, { recursive: true }).map((f) => join(dir, String(f))));
    for (const p of candidates) {
      const name = p.toLowerCase();
      if (name.endsWith(".md") && name.split("/").pop().includes(slug)) specPaths.push(p);
    }
  }
  for (const p of specPaths.slice(0, 3)) add("spec", `spec: ${p}`, source.cache ? git(["show", `${source.cache.head}:${p}`], gitDir) : readFileSync(p, "utf8"));

  // 2. The PR description and every issue it or its commits point at.
  add("description", "PR description", pr.body);
  const issues = new Set((pr.closingIssuesReferences ?? []).map((i) => i.number));
  for (const c of commits) for (const n of issueRefs(`${c.subject}\n${c.body}`)) issues.add(n);
  const readIssue = "readIssue" in source ? source.readIssue : repo ? (n) => ghJson(["issue", "view", String(n), "--json", "number,title,body"], { repo }) : null;
  for (const n of issues) {
    if (!readIssue) break;
    try {
      const i = readIssue(n);
      add("issue", `issue #${i.number}: ${i.title}`, `${i.title}\n\n${i.body || ""}`);
    } catch { /* a PR number or an unreadable issue: the commit text still counts */ }
  }

  // 3. Commit messages, when they say more than the title.
  const commitText = commits.map((c) => (c.body ? `${c.subject}\n${c.body}` : c.subject)).filter((t) => t && t !== pr.title).join("\n\n");
  if (commits.some((c) => isInformative(c.subject) || c.body)) add("commits", `${commits.length} commit message${commits.length === 1 ? "" : "s"}`, commitText);

  // 4. The title — always there, rarely enough.
  add("title", "PR title", pr.title);
  sources.sort((a, b) => INTENT_RANK[b.type] - INTENT_RANK[a.type]);

  const files = parseDiff(diffText ?? "");
  if (!files.length) throw new Error(`The diff of ${pr.number} is empty — nothing to tour.`);
  classifyAll(files, cfg);
  const facts = computeFacts(files, cfg);

  // The change map: which changed files use which, read at the PR head.
  const layers = cfg?.tour?.readingOrder ?? DEFAULT_READING_ORDER;
  const kindOf = new Map(files.map((f) => [f.path, f.meta.kind]));
  const layerOf = (p) => (kindOf.get(p) === "test" ? "tests" : layers.find((l) => matchAny(p, l.paths))?.name ?? "other");
  const readText = headReader(source, pr, repo, files);
  let changeMap = null;
  try { changeMap = buildChangeMap(files.map((f) => ({ path: f.path, kind: f.meta.kind })).filter((f) => files.find((x) => x.path === f.path).status !== "deleted"), readText, layerOf); }
  catch { /* a map is a nice-to-have; never fail the tour for it */ }

  return {
    kind: "tour",
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    repo,
    ...(source.cache ? { host: source.host ?? null, read: readCommands(source.cache) } : {}),
    config: {
      path: cfg ? configPath : null,
      note: cfg ? undefined : "no config — built-in defaults for tests, noise and reading order",
      readingOrder: cfg?.tour?.readingOrder ?? DEFAULT_READING_ORDER,
    },
    pr: {
      number: pr.number, title: pr.title || commits[0]?.subject || "(local diff)", url: pr.url, author: pr.author?.login ?? null, draft: !!pr.isDraft,
      base: pr.baseRefName, head: pr.headRefName, createdAt: pr.createdAt,
      additions: files.reduce((s, f) => s + f.additions, 0), deletions: files.reduce((s, f) => s + f.deletions, 0),
      filesChanged: files.length,
    },
    intent: { status: intentStatus(sources), sources },
    // Filled by the model through annotate.mjs:
    attention: null,  // { level, whatHappened, why, file, line, code } — how much attention this change needs
    explains: [],     // intent map: [{ quote, files }]
    unexplained: [],  // derived: non-noise files no quote explains
    unmatched: [],    // derived: quotes no file implements
    whatItDoes: null, // the model's reading of the diff — never the author's intent
    claims: [],
    items: facts,     // FACT items now; LOOK HERE and ASK WHY items get appended by annotate.mjs
    fileNotes: {},
    changeMap,        // { nodes, edges } — computed; null when fewer than 2 files or no import between them
    order: readingOrder(files, facts, cfg),
    orderRule: ORDER_RULE,
    files: files.map((f) => ({
      path: f.path, oldPath: f.oldPath, status: f.status, similarity: f.similarity, binary: f.binary,
      additions: f.additions, deletions: f.deletions,
      kind: f.meta.kind, noise: f.meta.noise, areas: f.meta.areas,
      hunks: f.hunks,
    })),
  };
}

// Reads a changed file as it is at the PR head: the local remote-tracking
// branch when it exists (pr-triage fetches it), else the GitHub API; for a
// saved diff, only the added lines are known.
function headReader(source, pr, repo, files) {
  const cache = new Map();
  const gitDir = source.cache?.gitDir;
  let ref = null;
  if (source.cache) ref = source.cache.head;
  else if (source.git) ref = source.git.split(/\.{2,3}/)[1];
  else if (repo && pr.headRefName) {
    try { git(["rev-parse", "--verify", "-q", `origin/${pr.headRefName}`]); ref = `origin/${pr.headRefName}`; }
    catch {
      try { git(["fetch", "--quiet", "origin", `+refs/heads/${pr.headRefName}:refs/remotes/origin/${pr.headRefName}`]); ref = `origin/${pr.headRefName}`; } catch { ref = null; }
    }
  }
  return (path) => {
    if (cache.has(path)) return cache.get(path);
    let text = null;
    try {
      if (ref) text = git(["show", `${ref}:${path}`], gitDir);
      else if (repo && pr.headRefOid) text = gh(["api", `repos/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${pr.headRefOid}`, "-H", "Accept: application/vnd.github.raw"]);
      else { const f = files.find((x) => x.path === path); text = f ? f.hunks.flatMap((h) => h.lines.filter((l) => l.t !== "del").map((l) => l.s)).join("\n") : null; }
    } catch { text = null; }
    cache.set(path, text);
    return text;
  };
}

// The exact commands a judge reads a cached PR with: no gh, no checkout, any host.
export function readCommands({ gitDir, base, head }) {
  // POSIX shells and PowerShell: single quotes keep $, ` and " literal. cmd.exe
  // passes single quotes through, so on Windows the path gets double quotes.
  const q = process.platform === "win32" ? `"${gitDir}"` : `'${String(gitDir).replace(/'/g, "'\\''")}'`;
  const g = `git --git-dir ${q}`;
  return { gitDir, base, head, diff: `${g} diff ${base}...${head}`, show: `${g} show ${head}:<path>`, grep: `${g} grep -n <pattern> ${head}` };
}

export function writeReport(outDir, name, report) {
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, name);
  writeFileSync(file, JSON.stringify(report, null, 2) + "\n");
  return file;
}

export function summarize(report) {
  const noise = report.files.filter((f) => f.noise);
  const facts = report.items.filter((i) => i.source === "fact");
  return {
    noiseLines: noise.reduce((n, f) => n + f.additions + f.deletions, 0),
    noiseFiles: noise.length,
    readLines: report.files.filter((f) => !f.noise).reduce((n, f) => n + f.additions + f.deletions, 0),
    highFacts: facts.filter((f) => f.severity === "high"),
    line: `intent: ${report.intent.status} (${report.intent.sources.map((x) => x.type).join(", ") || "none"}) · ${report.files.length} files (${noise.length} noise) · ${facts.length} facts (${facts.filter((f) => f.severity === "high").length} high)`,
  };
}
