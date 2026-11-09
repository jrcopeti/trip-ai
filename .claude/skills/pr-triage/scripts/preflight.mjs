#!/usr/bin/env node
// The login check: one row per repo — host, tool, status. Read-only: it never
// asks for a token, never stores a credential and never runs a login.
//
//   node preflight.mjs [--repo owner/name]
//
// With <home>/.config/pr-triage/repos.jsonc (and no --repo) it checks every
// listed repo; otherwise the current repo, or --repo, on GitHub.
// Exit 0 when at least one repo is ready; 1 when none is.

import { parseArgs } from "./lib.mjs";
import { loadRepoList, parseRepoEntry, preflight, formatTable, run, firstLine } from "./repos.mjs";

const args = parseArgs(process.argv.slice(2));
let entries;
let list;
try { list = args.repo ? null : loadRepoList(); }
catch (e) { console.error(e.message); process.exit(1); }
if (list) {
  console.log(`repo list: ${list.path}`);
  entries = list.repos;
} else {
  const r = args.repo ? { ok: true, stdout: JSON.stringify({ nameWithOwner: args.repo }) } : run("gh", ["repo", "view", "--json", "nameWithOwner"]);
  entries = r.ok
    ? [parseRepoEntry(`github:${JSON.parse(r.stdout).nameWithOwner}`)]
    : [{ id: "(current folder)", host: "github", path: null, error: r.missing ? "gh not installed — install: https://cli.github.com" : `not a GitHub repo here (${firstLine(r.stderr)}) — pass --repo owner/name or list repos in ~/.config/pr-triage/repos.jsonc` }];
}
if (!entries.length) { console.log("The repo list is empty: add entries like \"github:owner/repo\"."); process.exit(1); }
const rows = preflight(entries);
console.log(formatTable(rows));
const ready = rows.filter((r) => r.ready).length;
console.log(`${ready} of ${rows.length} ready${ready < rows.length ? " — triage runs only the ready repos" : ""}`);
process.exit(ready ? 0 : 1);
