// Many repos: the repo list, its entries, and the login check that runs
// before every multi-repo triage. pr-triage only. Zero dependencies; Node >= 18.
//
// The list lives in one place, <home>/.config/pr-triage/repos.jsonc:
//   { "repos": ["github:dmoka/ticket-bay", "github:<owner>/<repo>"] }
// No list -> pr-triage triages the current repo, as before.
//
// The login check never asks for a token, never stores a credential and
// never runs a login. It only reports what to install or run.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parseJsonc } from "./lib.mjs";

// Supported hosts. A new host adds an entry here, a check in checkOne and an adapter in hosts.mjs.
export const HOSTS = {
  github: { tool: "gh", parts: 2, shape: "github:<owner>/<repo>" },
};
// Hosts people will list that pr-triage cannot read yet: a clear line, never a crash.
const NOT_YET = { gitlab: "GitLab", azure: "Azure DevOps" };

export const INSTALL = {
  git: "https://git-scm.com/downloads",
  gh: "https://cli.github.com",
};

export const listPath = (home = homedir()) => join(home, ".config", "pr-triage", "repos.jsonc");

// Runs a command without a shell; never throws. `missing` means the command is not installed.
export function run(cmd, args, { input, env } = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", input, env, maxBuffer: 256 * 1024 * 1024 });
  // ENOTDIR: a PATH entry is a file, and the command is in none of the folders.
  const missing = ["ENOENT", "ENOTDIR"].includes(r.error?.code);
  return { ok: !r.error && r.status === 0, code: r.status, stdout: r.stdout ?? "", stderr: r.error && !missing ? String(r.error.message) : r.stderr ?? "", missing };
}

export const firstLine = (s) => String(s ?? "").trim().split(/\r?\n/).find((l) => l.trim())?.trim() ?? "";

// "github:dmoka/ticket-bay" -> { id, host, path, name, error: null }.
// A bad or unsupported entry keeps its text and carries the reason in `error`.
export function parseRepoEntry(text) {
  const s = String(text ?? "").trim();
  if (!s) return { id: "(empty entry)", host: null, path: null, error: `empty — write "github:<owner>/<repo>"` };
  // Common slips get the entry they meant: a URL, "gh:", a bare owner/repo.
  // Any github.com URL: a repo, a PR, a file. Owner and repo are its first two parts.
  const url = s.match(/^https?:\/\/(?:www\.)?github\.com\/([^/\s?#]+)\/([^/\s?#]+)/i);
  if (url) return { id: s, host: null, path: null, error: `did you mean "github:${url[1]}/${url[2].replace(/\.git$/i, "")}"?` };
  const m = s.match(/^([A-Za-z][\w-]*):(.+)$/);
  if (!m) {
    const bare = /^[\w.-]+\/[\w.-]+$/.test(s) ? ` — did you mean "github:${s}"?` : `, e.g. "github:owner/repo"`;
    return { id: s, host: null, path: null, error: `expected "<host>:<path>"${bare}` };
  }
  const host = m[1].toLowerCase();
  let path = m[2].trim().replace(/^\/+|\/+$/g, "");
  // GitHub owner and repo names ignore case: one repo, one id, one cache folder.
  if (host === "github") path = path.toLowerCase();
  const id = `${host}:${path}`;
  if (NOT_YET[host]) return { id, host, path, error: `${NOT_YET[host]} is not supported yet` };
  const spec = HOSTS[host];
  if (!spec) return { id, host, path, error: `unknown host "${host}" — ${host === "gh" ? `did you mean "github:${path}"?` : "use github:"}` };
  const parts = path.split("/");
  // Each part becomes a folder of the cache, so "." and ".." are refused.
  if (parts.length !== spec.parts || parts.some((p) => !p.trim() || p === "." || p === ".." || /[\\\x00-\x1f]/.test(p))) {
    return { id, host, path, error: `expected ${spec.shape}` };
  }
  return { id, host, path, name: parts[parts.length - 1], error: null };
}

// The list, or null when there is none. Duplicates are dropped. Each entry
// gets a `slug` for file names and links: "dmoka/ticket-bay" -> "dmoka-ticket-bay".
export function loadRepoList(home = homedir()) {
  const path = listPath(home);
  if (!existsSync(path)) return null;
  const text = readFileSync(path, "utf8");
  if (!text.trim()) return { path, repos: [] };
  let data;
  try { data = parseJsonc(text); }
  catch (e) { throw new Error(`${path}: not valid JSONC — ${e.message}`); }
  if (!Array.isArray(data?.repos) || data.repos.some((r) => typeof r !== "string")) {
    throw new Error(`${path}: expected { "repos": ["github:owner/repo", ...] }`);
  }
  const repos = [];
  const slugs = new Set();
  for (const text of data.repos) {
    const e = parseRepoEntry(text);
    if (repos.some((r) => r.id === e.id)) continue;
    const base = String(e.path ?? e.id).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "repo";
    let slug = base;
    for (let i = 2; slugs.has(slug.toLowerCase()); i++) slug = `${base}-${i}`;
    slugs.add(slug.toLowerCase()); // case-insensitive file systems: "A-b" and "a-b" are one file
    repos.push({ ...e, slug });
  }
  return { path, repos };
}

// One row per repo: { ...entry, tool, ready, status }. In order: git and the
// host's tool installed? logged in? can this login read the repo?
export function preflight(entries, { run: exec = run, env = process.env } = {}) {
  const seen = new Map();
  const once = (key, fn) => { if (!seen.has(key)) seen.set(key, fn()); return seen.get(key); };
  return entries.map((e) => ({ ...e, ...checkOne(e, exec, once, env) }));
}

// GitHub answers "not found" both for a repo that does not exist and for a
// private one this login cannot see, so the message names both.
const CANNOT_READ = "not found — check the spelling; if it is private, your login can't read this repo; ask for read access";
// gh says "Could not resolve to a Repository" for that case: that is not the network.
const NETWORK = /error connecting to|could not resolve host|no such host|timed? ?out|network is unreachable|no route to host|dial tcp|proxyconnect|ENOTFOUND|ECONNRESET|connection (refused|reset)/i;
const cannotRead = (r) => (NETWORK.test(r.stderr) ? `network error: ${firstLine(r.stderr)}` : CANNOT_READ);

function checkOne(e, exec, once, env) {
  if (e.error) return { tool: HOSTS[e.host]?.tool ?? "—", ready: false, status: e.error };
  const tool = HOSTS[e.host].tool;
  const fail = (status) => ({ tool, ready: false, status });
  if (once("git", () => exec("git", ["--version"])).missing) return fail(`git not installed — install: ${INSTALL.git}`);
  // github
  if (once("gh", () => exec("gh", ["--version"])).missing) return fail(`gh not installed — install: ${INSTALL.gh}`);
  // --active: a stale second account must not hide a working one. gh before 2.40 has no --active.
  const auth = once("gh-auth", () => {
    const r = exec("gh", ["auth", "status", "--active", "--hostname", "github.com"]);
    return /unknown flag/.test(r.stderr) ? exec("gh", ["auth", "status", "--hostname", "github.com"]) : r;
  });
  if (!auth.ok) {
    // Offline, gh calls every token invalid. One API call tells the network apart from the login.
    const probe = once("gh-net", () => exec("gh", ["api", "--hostname", "github.com", "rate_limit"]));
    if (!probe.ok && NETWORK.test(probe.stderr)) return fail(`network error: can't reach github.com — ${firstLine(probe.stderr)}`);
    // gh prefers a token in the environment over its own login; `gh auth login` cannot fix a bad one.
    const envToken = ["GH_TOKEN", "GITHUB_TOKEN"].find((k) => env[k]);
    return fail(envToken ? `${envToken} is set but not valid — unset it or replace it` : "not logged in — run: gh auth login");
  }
  const r = exec("gh", ["repo", "view", e.path, "--json", "nameWithOwner"]);
  return r.ok ? { tool, ready: true, status: "ready" } : fail(cannotRead(r));
}

export function formatTable(rows) {
  const cols = [["repo", (r) => r.id], ["host", (r) => r.host ?? "?"], ["tool", (r) => r.tool], ["status", (r) => r.status]];
  const cells = rows.map((r) => cols.map(([, f]) => String(f(r) ?? "")));
  const width = cols.map(([h], i) => Math.max(h.length, ...cells.map((c) => c[i].length)));
  const line = (c) => c.map((x, i) => (i === c.length - 1 ? x : x.padEnd(width[i]))).join("  ");
  return [line(cols.map(([h]) => h)), line(width.map((w) => "-".repeat(w))), ...cells.map(line)].join("\n");
}
