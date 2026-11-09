// Shared by pr-triage and pr-tour. Source of truth: shared/lib.mjs in
// github.com/dmoka/skills — each skill folder carries an identical copy so it
// installs with one `cp -r`. Zero dependencies; Node >= 18.
//
// Everything in this file is deterministic. It turns `gh` output into facts.
// The model never computes a fact; it only explains them.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

export const SCHEMA_VERSION = 1;

// ---------- gh ----------

export function gh(args, { repo } = {}) {
  const full = repo ? [...args, "--repo", repo] : args;
  try {
    return execFileSync("gh", full, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  } catch (err) {
    const msg = (err.stderr || err.message || "").toString().trim();
    throw new Error(`gh ${full.join(" ")} failed: ${msg}`);
  }
}

export function ghJson(args, opts) {
  return JSON.parse(gh(args, opts));
}

export function resolveRepo(repo) {
  if (repo) return repo;
  return ghJson(["repo", "view", "--json", "nameWithOwner"]).nameWithOwner;
}

// ---------- args ----------

export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

// ---------- JSONC ----------

// Strips // and /* */ comments outside strings, then trailing commas.
export function parseJsonc(text) {
  let out = "";
  let inStr = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (inStr) {
      out += c;
      if (c === "\\") { out += n ?? ""; i++; }
      else if (c === '"') inStr = false;
    } else if (c === '"') { inStr = true; out += c; }
    else if (c === "/" && n === "/") { while (i < text.length && text[i] !== "\n") i++; out += "\n"; }
    else if (c === "/" && n === "*") { i += 2; while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++; i++; }
    else out += c;
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}

// ---------- config ----------

export const CONFIG_PATH = ".github/pr-review.jsonc";

export function loadConfig(path = CONFIG_PATH) {
  if (!existsSync(path)) return null;
  return normalizeConfig(parseJsonc(readFileSync(path, "utf8")), path);
}

// `where` names the file in errors: a path, or "<repo>:<path>" for a file read from git.
export function normalizeConfig(cfg, where = CONFIG_PATH) {
  if (cfg.version !== 1) throw new Error(`${where}: unsupported "version" ${cfg.version} (expected 1)`);
  cfg.areas ??= {};
  cfg.tests ??= [];
  cfg.noise ??= [];
  cfg.tour ??= {};
  // Everything in the file is optional. It only tunes noise, tests, areas
  // (hints the model sees) and the reading order; nothing in it ranks PRs.
  return cfg;
}

// ---------- glob ----------

const globCache = new Map();

// Supports **, *, ?, {a,b}. A pattern without "/" matches the basename anywhere.
export function globToRegex(glob) {
  if (globCache.has(glob)) return globCache.get(glob);
  let g = glob.includes("/") ? glob.replace(/^\.?\//, "") : `**/${glob}`;
  let re = "";
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === "*" && g[i + 1] === "*") {
      if (g[i + 2] === "/") { re += "(?:.*/)?"; i += 2; } else { re += ".*"; i++; }
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else if (c === "{") {
      const end = g.indexOf("}", i);
      re += "(?:" + g.slice(i + 1, end).split(",").map(escapeRe).join("|") + ")";
      i = end;
    } else re += escapeRe(c);
  }
  const rx = new RegExp(`^${re}$`);
  globCache.set(glob, rx);
  return rx;
}

function escapeRe(s) { return s.replace(/[.+^${}()|[\]\\]/g, "\\$&"); }

export function matchAny(path, globs = []) {
  return globs.some((g) => globToRegex(g).test(path));
}

// ---------- diff ----------

// Parses `git diff` / `gh pr diff` output into files with hunks and line numbers.
export function parseDiff(text) {
  const files = [];
  let f = null;
  let h = null;
  let oldNo = 0;
  let newNo = 0;
  for (const raw of text.split("\n")) {
    if (raw.startsWith("diff --git ")) {
      const m = raw.match(/^diff --git a\/(.*) b\/(.*)$/);
      f = { path: m ? m[2] : raw, oldPath: m ? m[1] : null, status: "modified", similarity: null, binary: false, hunks: [], additions: 0, deletions: 0 };
      files.push(f);
      h = null;
      continue;
    }
    if (!f) continue;
    if (!h) {
      if (raw.startsWith("new file mode")) f.status = "added";
      else if (raw.startsWith("deleted file mode")) f.status = "deleted";
      else if (raw.startsWith("rename from ")) { f.status = "renamed"; f.oldPath = raw.slice(12); }
      else if (raw.startsWith("rename to ")) f.path = raw.slice(10);
      else if (raw.startsWith("similarity index ")) f.similarity = parseInt(raw.slice(17), 10);
      else if (raw.startsWith("Binary files ")) f.binary = true;
      else if (raw.startsWith("+++ ") && raw !== "+++ /dev/null") f.path = raw.slice(6);
    }
    const hm = raw.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)$/);
    if (hm) {
      oldNo = +hm[1];
      newNo = +hm[2];
      h = { header: raw, context: hm[3].trim(), lines: [] };
      f.hunks.push(h);
      continue;
    }
    if (!h) continue;
    const c = raw[0];
    if (c === "+") { h.lines.push({ t: "add", s: raw.slice(1), n: newNo++ }); f.additions++; }
    else if (c === "-") { h.lines.push({ t: "del", s: raw.slice(1), o: oldNo++ }); f.deletions++; }
    else if (c === " ") h.lines.push({ t: "ctx", s: raw.slice(1), o: oldNo++, n: newNo++ });
    // "\ No newline at end of file" and blank trailing lines are ignored.
  }
  for (const file of files) if (file.status !== "renamed") file.oldPath = file.status === "added" ? null : file.oldPath;
  return files;
}

export const added = (f) => f.hunks.flatMap((h) => h.lines.filter((l) => l.t === "add"));
export const removed = (f) => f.hunks.flatMap((h) => h.lines.filter((l) => l.t === "del"));

// ---------- classification ----------

const LOCKFILES = [
  "package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml", "bun.lock", "bun.lockb",
  "Cargo.lock", "poetry.lock", "Pipfile.lock", "uv.lock", "go.sum", "composer.lock", "Gemfile.lock",
  "packages.lock.json", "gradle.lockfile", "flake.lock",
];
const GENERATED = ["**/*.snap", "**/__snapshots__/**", "dist/**", "build/**", "**/*.min.js", "**/*.min.css", "**/*.generated.*", "**/*.g.cs", "**/*.pb.go",
  "**/*.min.mjs", "**/*.bundle.js", "**/*.js.map", "**/*.css.map"];
// State an ORM or migration tool rewrites on every migration; the migration itself stays readable.
const ORM_SNAPSHOTS = [
  "**/meta/*_snapshot.json", "**/meta/_journal.json",          // Drizzle Kit
  "**/*ModelSnapshot.cs", "**/Migrations/*.Designer.cs",       // EF Core
  "**/migration_lock.toml",                                     // Prisma
];
const GENERATED_HEADER = /@generated|DO NOT EDIT|auto-?generated|automatically generated|this file (is|was|has been) generated|code generated by/i;
// Hand-edited JSON that can grow large; never collapsed by size.
const HAND_JSON = /^(\..*|package|tsconfig.*|jsconfig|composer|deno|turbo|vercel|renovate|angular|nx|project|app|manifest|openapi.*|swagger.*)\.json$/;

// Machine-written content the path does not give away: minified or bundled
// code (a line over 1000 characters, or 200 on average) and large JSON files.
function machineWritten(path, a) {
  if (!a.length) return null;
  const base = path.split("/").pop();
  const long = a.some((l) => l.s.length > 1000) || a.reduce((n, l) => n + l.s.length, 0) / a.length > 200;
  if (long && /\.(js|mjs|cjs|css|json|svg)$/.test(path)) return "generated: minified or bundled";
  if (/\.json$/.test(path) && a.length >= 500 && !HAND_JSON.test(base)) return "generated: large JSON";
  return null;
}
const DEFAULT_TESTS = [
  "**/test/**", "**/tests/**", "**/__tests__/**", "**/spec/**", "**/e2e/**",
  "**/*.test.*", "**/*.spec.*", "**/*_test.go", "**/*_test.py", "**/test_*.py",
  "**/*Test.java", "**/*Tests.java", "**/*Test.kt", "**/*Tests.cs", "**/*Test.cs",
];
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|kt|cs|rb|php|swift|scala|vue|svelte)$/;

export function isTest(path, cfg) {
  return matchAny(path, [...DEFAULT_TESTS, ...(cfg?.tests ?? [])]);
}

// "tests/domain/refund.rounding.property.test.ts" -> "refund"
export function stemOf(path) {
  const base = path.split("/").pop();
  return base
    .replace(/^test_/, "")
    .replace(/(_test|Tests?)(?=\.[^.]+$)/, "")
    .split(".")[0]
    .toLowerCase();
}

// A test pairs with a source file when the names match, or when the test's
// name starts with the source's: "orders-service.test.ts" tests "orders.ts".
export function testsSource(testStem, srcStem) {
  return testStem === srcStem || testStem.startsWith(srcStem + "-") || testStem.startsWith(srcStem + "_");
}

export function areasOf(path, cfg) {
  return Object.entries(cfg?.areas ?? {}).filter(([, globs]) => matchAny(path, globs)).map(([name]) => name);
}

// Whitespace, quotes, commas, semicolons, parens and JSX {" "} only:
// prettier-style churn. Compares whole hunk sides (context included), because
// a diff often aligns a moved closing line as context on one side only.
function normalizeFormat(f, side) {
  const drop = side === "new" ? "del" : "add";
  return f.hunks.flatMap((h) => h.lines.filter((l) => l.t !== drop)).map((l) => l.s).join("")
    .replace(/['`]/g, '"').replace(/\{"\s*"\}/g, "").replace(/[\s,;()]/g, "");
}

// "orders-repo" -> "bookings-repo" gives [["orders", "bookings"]] plus case variants.
function renameSwaps(files) {
  const words = (p) => stemFull(p).replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const swaps = new Map();
  for (const f of files) {
    if (f.status !== "renamed" || !f.oldPath) continue;
    const a = words(f.oldPath);
    const b = words(f.path);
    if (a.length !== b.length) continue;
    a.forEach((w, i) => { if (w !== b[i]) swaps.set(w, b[i]); });
  }
  const out = [];
  const cap = (w) => w[0].toUpperCase() + w.slice(1);
  for (const [x, y] of swaps) {
    const pairs = [[x, y]];
    if (x.endsWith("s") && y.endsWith("s")) pairs.push([x.slice(0, -1), y.slice(0, -1)]); // orders -> order
    for (const [a, b] of pairs) out.push([a, b], [cap(a), cap(b)], [a.toUpperCase(), b.toUpperCase()]);
  }
  return out;
}
const stemFull = (p) => p.split("/").pop().replace(/\.[^.]+$/, "");

// A file whose every changed token is exactly one of the rename swaps.
function isMechanicalRename(f, swaps) {
  if (!swaps.length) return false;
  const apply = (t) => swaps.reduce((acc, [x, y]) => acc.split(x).join(y), t);
  for (const h of f.hunks) {
    const dels = h.lines.filter((l) => l.t === "del");
    const adds = h.lines.filter((l) => l.t === "add");
    if (dels.length !== adds.length) return false;
    for (let i = 0; i < dels.length; i++) {
      // Token by token: each token is unchanged or exactly swapped.
      const a = dels[i].s.split(/(\W+)/);
      const b = adds[i].s.split(/(\W+)/);
      if (a.length !== b.length) return false;
      const importLine = IMPORT_LINE.test(dels[i].s);
      let quotes = 0;
      for (let j = 0; j < a.length; j++) {
        if (a[j] !== b[j]) {
          if (apply(a[j]) !== b[j]) return false;
          // A swap inside a string literal ("orders" table name) is a behaviour
          // change, not a rename — allowed only in import paths.
          if (quotes % 2 === 1 && !importLine) return false;
        }
        quotes += (a[j].match(/["'`]/g) || []).length;
      }
    }
  }
  return f.additions + f.deletions > 0;
}

// Classifies every file of one PR; needs the whole PR to see rename swaps.
export function classifyAll(files, cfg) {
  const swaps = renameSwaps(files);
  for (const f of files) {
    f.meta = classify(f, cfg);
    if (!f.meta.noise && isMechanicalRename(f, swaps)) {
      f.meta.noise = "mechanical rename";
      f.meta.kind = "noise";
    }
  }
  return files;
}

const IMPORT_LINE = /^\s*(import\b|export\s+(\*|\{[^}]*\})\s+from\b|from\s+\S+\s+import\b|using\s+[\w.]+;|use\s+[\w:]+|require\(|const\s+\w+\s*=\s*require\(|\}\s*from\s+["'])/;

export function classify(f, cfg) {
  const path = f.path;
  const a = added(f);
  const r = removed(f);
  const base = path.split("/").pop();
  let noise = null;
  if (LOCKFILES.includes(base)) noise = "lockfile";
  else if (matchAny(path, cfg?.noise ?? [])) noise = "configured noise";
  else if (matchAny(path, ORM_SNAPSHOTS)) noise = "generated: ORM snapshot";
  else if (matchAny(path, GENERATED) || a.slice(0, 5).some((l) => GENERATED_HEADER.test(l.s))) noise = "generated";
  else if (f.binary) noise = "binary";
  else if (f.status === "renamed" && a.length === 0 && r.length === 0) noise = "pure rename";
  else if (a.length + r.length > 0 && normalizeFormat(f, "new") === normalizeFormat(f, "old")) noise = "formatting only";
  else if (a.length + r.length > 0 && [...a, ...r].every((l) => l.s.trim() === "" || IMPORT_LINE.test(l.s))) noise = "imports only";
  else noise = machineWritten(path, a);
  const test = isTest(path, cfg);
  const kind = noise ? "noise" : test ? "test" : CODE_EXT.test(path) ? "source" : "other";
  return { kind, noise, test, stem: stemOf(path), areas: areasOf(path, cfg) };
}

// ---------- facts ----------
// A fact is something a script can prove from the diff. Each one carries the
// file and line it came from, so a reader can check it in one click.

const SKIP = /\b(?:it|test|describe|context|suite)\.(?:skip|todo)\s*\(|\bx(?:it|describe|test)\s*\(|@Disabled\b|@Ignore\b|pytest\.mark\.skip|unittest\.skip|\bt\.Skip\(|\[(?:Fact|Theory)\s*\(\s*Skip\s*=|#\[ignore\]/;
const FOCUS = /\b(?:it|test|describe|context)\.only\s*\(|\bf(?:it|describe)\s*\(/;
const ASSERT = /\bexpect\s*\(|\bassert\w*\s*[(.]|\bshould\b|\bAssert\.\w+\(|\bassertThat\(/;
const DESTRUCTIVE_SQL = /\b(DROP\s+(?:TABLE|COLUMN|INDEX|CONSTRAINT|SCHEMA)|TRUNCATE\b|ALTER\s+TABLE\s+\S+\s+DROP\b|RENAME\s+(?:COLUMN|TO)\b|DELETE\s+FROM\b)/i;
const DEP_LINE = /^\s*"(@?[\w.\-/]+)"\s*:\s*"([^"]+)"\s*,?\s*$/;

export function computeFacts(files, cfg) {
  const facts = [];
  const push = (kind, severity, file, line, text) => facts.push({ source: "fact", kind, severity, file, line, text });
  const changedTests = files.filter((f) => f.meta.kind === "test" || (f.meta.test && f.meta.noise));
  const testStems = changedTests.map((f) => f.meta.stem);

  for (const f of files) {
    const m = f.meta;
    const a = added(f);
    const r = removed(f);
    if (m.test) {
      for (const l of a) if (SKIP.test(l.s)) push("skip-added", "high", f.path, l.n, `Adds a skipped test: \`${l.s.trim().slice(0, 100)}\``);
      for (const l of a) if (FOCUS.test(l.s)) push("focus-added", "high", f.path, l.n, `Adds a focused test (\`.only\`) — the rest of the file stops running: \`${l.s.trim().slice(0, 100)}\``);
      const net = r.filter((l) => ASSERT.test(l.s)).length - a.filter((l) => ASSERT.test(l.s)).length;
      if (net > 0) {
        const gone = r.find((l) => ASSERT.test(l.s));
        facts.push({ source: "fact", kind: "assertions-removed", severity: "medium", file: f.path, line: gone.o, side: "old",
          text: `Removes ${net} more assertion${net > 1 ? "s" : ""} than it adds: \`${gone.s.trim().slice(0, 90)}\`` });
      }
      if (f.status === "deleted") push("test-deleted", "high", f.path, null, "Deletes a test file.");
    }
    if (/\.sql$/i.test(f.path) || matchAny(f.path, cfg?.areas?.migrations ?? [])) {
      for (const l of a) if (DESTRUCTIVE_SQL.test(l.s)) push("destructive-sql", "high", f.path, l.n, `Destructive schema change: \`${l.s.trim().slice(0, 100)}\``);
    }
    if (f.path.split("/").pop() === "package.json") {
      const before = new Map(r.map((l) => l.s.match(DEP_LINE)).filter(Boolean).map((x) => [x[1], x[2]]));
      for (const l of a) {
        const d = l.s.match(DEP_LINE);
        if (!d || ["name", "version", "description"].includes(d[1]) || !/\d|workspace:|file:|git/.test(d[2])) continue;
        if (!before.has(d[1])) push("dependency-added", "medium", f.path, l.n, `Adds dependency \`${d[1]}\` ${d[2]}.`);
        else if (before.get(d[1]) !== d[2]) push("dependency-changed", "low", f.path, l.n, `Changes \`${d[1]}\` ${before.get(d[1])} → ${d[2]}.`);
      }
    }
    if (m.kind === "source" && !testStems.some((t) => testsSource(t, m.stem)) && !/\.config\.[^.]+$/.test(f.path)) {
      // Low on its own: most changes to glue code carry no test. Medium where you said it matters.
      push("untested-change", m.areas.length ? "medium" : "low", f.path, null, `Source changed (+${f.additions} −${f.deletions}); no changed test shares its name.`);
    }
    for (const area of m.areas) {
      // Context, not a finding: the area also shows as a tag on the file.
      if (area === "migrations" && /\.sql$/i.test(f.path)) push("area", "low", f.path, null, "Touches area **migrations**.");
      else if (area !== "migrations" && !m.noise) push("area", "low", f.path, null, `Touches area **${area}**.`);
    }
  }
  return facts;
}

function firstLine(f) {
  for (const h of f.hunks) for (const l of h.lines) if (l.t !== "ctx") return l.n ?? l.o;
  return null;
}

// ---------- reading order (pr-tour) ----------

export const DEFAULT_READING_ORDER = [
  { name: "contracts & schema", paths: ["**/*.d.ts", "**/types/**", "**/types.*", "**/schema.*", "**/*.proto", "**/openapi.*", "**/*.graphql", "**/migrations/**", "**/*.sql"] },
  { name: "domain", paths: ["**/domain/**", "**/core/**", "**/models/**", "**/entities/**"] },
  { name: "services & data", paths: ["**/services/**", "**/service/**", "**/db/**", "**/repositories/**", "**/api/**", "**/server/**", "**/payments/**", "**/lib/**"] },
  { name: "UI & entry points", paths: ["app/**", "**/components/**", "**/pages/**", "**/ui/**", "**/routes/**", "**/controllers/**"] },
  { name: "config & scripts", paths: ["**/*.config.*", "**/*.json", "**/*.yml", "**/*.yaml", "**/*.toml", "scripts/**", ".github/**"] },
];

const SEV = { high: 3, medium: 2, low: 1 };
export const sevRank = (s) => SEV[s] ?? 0;

// Deterministic order: hotspots (a high item) first, then by layer, tests
// straight after the code they test, orphan tests after, noise collapsed last.
export function readingOrder(files, items, cfg) {
  const layers = cfg?.tour?.readingOrder ?? DEFAULT_READING_ORDER;
  const layerOf = (p) => { const i = layers.findIndex((l) => matchAny(p, l.paths)); return i < 0 ? layers.length : i; };
  const maxSev = (p) => Math.max(0, ...items.filter((x) => x.file === p).map((x) => sevRank(x.severity)));
  const code = files.filter((f) => f.meta.kind !== "noise" && f.meta.kind !== "test");
  const tests = files.filter((f) => f.meta.kind === "test");
  const noise = files.filter((f) => f.meta.kind === "noise");
  const pairOf = new Map();
  for (const t of tests) {
    // Prefer an exact name match, then the longest source name the test starts with.
    const src = code.filter((c) => testsSource(t.meta.stem, c.meta.stem)).sort((a, b) => b.meta.stem.length - a.meta.stem.length)[0];
    if (src) pairOf.set(t.path, src.path);
  }
  const groupSev = (c) => Math.max(maxSev(c.path), ...tests.filter((t) => pairOf.get(t.path) === c.path).map((t) => maxSev(t.path)));
  const byLayer = (x, y) => layerOf(x.path) - layerOf(y.path) || x.path.localeCompare(y.path);
  const hot = code.filter((c) => groupSev(c) === 3).sort(byLayer);
  const rest = code.filter((c) => groupSev(c) < 3).sort(byLayer);
  const orphans = tests.filter((t) => !pairOf.has(t.path));
  const hotOrphans = orphans.filter((t) => maxSev(t.path) === 3);
  const coldOrphans = orphans.filter((t) => maxSev(t.path) < 3).sort(byLayer);
  const out = [];
  const layerName = (p) => layers[layerOf(p)]?.name ?? "other";
  const withTests = (c, why) => {
    out.push({ path: c.path, role: "code", why });
    for (const t of tests.filter((t) => pairOf.get(t.path) === c.path).sort((a, b) => a.path.localeCompare(b.path))) {
      out.push({ path: t.path, role: "test", pairedWith: c.path, why: `test for ${c.path.split("/").pop()}` });
    }
  };
  for (const c of hot) withTests(c, `hotspot — high-severity item · ${layerName(c.path)}`);
  for (const t of hotOrphans) out.push({ path: t.path, role: "test", why: "hotspot — high-severity item in a test" });
  for (const c of rest) withTests(c, `layer ${layerOf(c.path) + 1}: ${layerName(c.path)}`);
  for (const t of coldOrphans) out.push({ path: t.path, role: "test", why: "test with no changed source file" });
  for (const n of noise.sort((a, b) => a.path.localeCompare(b.path))) out.push({ path: n.path, role: "noise", why: n.meta.noise });
  return out;
}

// ---------- intent (pr-tour) ----------
// Intent is only ever the author's own words. Sources, strongest first:
// a spec or review contract, the PR description and linked issues, commit
// messages, the title. The model may quote them; it may never add to them.

export const INTENT_RANK = { spec: 4, description: 3, issue: 3, commits: 2, title: 1 };

// "wip", "fix", "chore: update" say nothing. Two real words after the
// conventional-commit prefix are the minimum for a title to count.
const WEAK = new Set(["wip", "fix", "fixes", "fixed", "update", "updates", "updated", "change", "changes", "misc", "tmp", "stuff", "minor", "cleanup", "tweak", "tweaks", "test", "tests", "pr", "draft"]);
export function isInformative(text) {
  const words = String(text ?? "").replace(/^\s*[a-z]+(\([^)]*\))?!?:\s*/i, "").split(/[^A-Za-z0-9]+/).filter((w) => w && !WEAK.has(w.toLowerCase()));
  return words.length >= 2;
}

// "Closes #12", "fixes #7", a bare "#31" in a commit message.
export function issueRefs(text) {
  return [...new Set([...String(text ?? "").matchAll(/(?:^|[\s(])#(\d+)\b/g)].map((m) => +m[1]))];
}

// "feat/event-waitlist" -> "event-waitlist"
export const branchSlug = (branch) => String(branch ?? "").split("/").pop().toLowerCase();

export function intentStatus(sources) {
  const best = Math.max(0, ...sources.filter((s) => s.type !== "title" || isInformative(s.text)).map((s) => INTENT_RANK[s.type] ?? 0));
  return best >= 4 ? "spec" : best >= 2 ? "described" : best === 1 ? "title only" : "UNKNOWN";
}
