// The code cache for many repos: one bare partial clone per repo in
// <home>/.cache/pr-triage/<host>/<path>. No working tree, so it never touches
// a checkout of the user's. Every open PR head sits in refs/pr-triage/pr/<n>;
// the default branch and each PR's base branch sit in refs/heads/<branch>.
// Judges read with `git --git-dir=<cache> show|grep|diff <ref>`.
//
// Each sync fetches the current heads (a push or a rebase moves them), drops
// the refs of PRs that closed, updates the default branch, and downloads the
// files at every fetched head in one batch, so reads stay offline and fast.

import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync, statSync, renameSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { run as defaultRun, firstLine } from "./repos.mjs";

export const cacheRoot = (home = homedir()) => join(home, ".cache", "pr-triage");
export const cacheDirOf = (entry, home) => join(cacheRoot(home), entry.host, ...entry.path.split("/"));
export const prRef = (n) => `refs/pr-triage/pr/${n}`;
// Locks live in their own tree: "<repo>.lock" beside the cache could be a real repo's name.
const locksRoot = (home) => join(cacheRoot(home), ".locks");
export const lockDirOf = (entry, home) => join(locksRoot(home), entry.host, ...entry.path.split("/"));

// A cache command never inherits a repo the caller pointed git at.
function gitEnv(extra) {
  const env = { ...process.env, ...extra };
  for (const k of ["GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY", "GIT_NAMESPACE"]) delete env[k];
  return env;
}

export function cacheGit(dir, args, { run = defaultRun, env, input } = {}) {
  const r = run("git", dir ? ["--git-dir", dir, ...args] : args, { env: gitEnv(env), input });
  if (!r.ok) throw new Error(`git ${args.slice(0, 2).join(" ")} failed: ${firstLine(r.stderr) || `exit ${r.code}`}`);
  return r.stdout;
}

// Brings the cache of one repo up to date with its open PRs. One run at a
// time per repo (a lock beside the cache). A broken cache is deleted and
// cloned again once: it holds nothing that cannot be fetched again.
// Returns { dir, failed: Map<number, reason>, read(ref, path) }.
export function syncCache(opts) {
  const { entry, info, home, run = defaultRun } = opts;
  const dir = cacheDirOf(entry, home);
  if (!info.defaultBranch) throw new Error(`${entry.id}: the host reports no default branch (an empty repo?)`);
  mkdirSync(dirname(dir), { recursive: true });
  return withLock(lockDirOf(entry, home), entry.id, home, () => {
    if (existsSync(dir) && !healthy(dir, run)) {
      console.error(`${entry.id}: the cache is broken; deleting it and cloning again`);
      rmSync(dir, { recursive: true, force: true });
    }
    try { return syncOnce(opts, dir); }
    catch (e) { throw new Error(`${e.message} — if it keeps failing, run: node scripts/triage.mjs --clean-cache ${entry.id}`); }
  });
}

// Readable config, readable refs, and the commit HEAD names is present.
function healthy(dir, run) {
  const ok = (args) => run("git", ["--git-dir", dir, ...args], { env: gitEnv() }).ok;
  return existsSync(join(dir, "HEAD")) && ok(["config", "--get", "remote.origin.url"]) && ok(["for-each-ref", "--count=1"])
    && ok(["rev-parse", "--verify", "--quiet", "HEAD^{commit}"]);
}

// A lock is a folder holding the owner's pid. It is built under a temporary
// name and renamed into place, so it never exists without its pid, and the
// rename fails when another run holds it. A lock whose process is gone is
// taken over (see lockState).
function withLock(lock, id, home, fn, { waitMs = 10 * 60 * 1000 } = {}) {
  const start = Date.now();
  const nap = new Int32Array(new SharedArrayBuffer(4));
  const tmp = join(locksRoot(home), ".tmp", `${process.pid}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dirname(lock), { recursive: true });
  let told = false;
  for (;;) {
    mkdirSync(tmp, { recursive: true });
    writeFileSync(join(tmp, "pid"), String(process.pid));
    try { renameSync(tmp, lock); break; }
    catch (e) {
      rmSync(tmp, { recursive: true, force: true });
      if (!["EEXIST", "ENOTEMPTY", "EPERM", "EACCES"].includes(e.code)) throw e;
      const holder = lockState(lock);
      if (holder.stale) { takeOver(lock, holder.pid); continue; }
      if (!told) { console.error(`waiting for another pr-triage run (pid ${holder.pid ?? "?"}) to finish with ${id}…`); told = true; }
      if (Date.now() - start > waitMs) throw new Error(`another pr-triage run (pid ${holder.pid ?? "?"}) holds ${lock}; if none is running, delete that folder`);
      Atomics.wait(nap, 0, 0, 250);
    }
  }
  try { return fn(); } finally { rmSync(lock, { recursive: true, force: true }); }
}

// { pid, stale }: stale when the pid is dead, or the pid file is missing for 30 s.
// A live pid wins, however long its sync takes; only after 6 hours is a live
// pid taken for a reused one.
export function lockState(lock) {
  let age;
  try { age = Date.now() - statSync(lock).mtimeMs; } catch { return { pid: null, stale: false, free: true }; }
  let pid = null;
  try { pid = Number(readFileSync(join(lock, "pid"), "utf8")) || null; } catch { /* no pid file */ }
  if (age > 6 * 60 * 60 * 1000) return { pid, stale: true };
  if (!pid) return { pid, stale: age > 30 * 1000 };
  try { process.kill(pid, 0); return { pid, stale: false }; } catch (e) { return { pid, stale: e.code === "ESRCH" }; }
}

// Moves the stale lock aside first, so two runs that both saw it stale never
// delete a lock a third run just took.
function takeOver(lock, stalePid) {
  const trash = `${dirname(lock)}${sep}.stale-${process.pid}-${Math.random().toString(36).slice(2)}`;
  try { renameSync(lock, trash); } catch { return; }
  let pid = null;
  try { pid = Number(readFileSync(join(trash, "pid"), "utf8")) || null; } catch { /* none */ }
  if (pid !== stalePid) { try { renameSync(trash, lock); return; } catch { /* the name is taken again */ } }
  rmSync(trash, { recursive: true, force: true });
}

function syncOnce({ entry, info, prs, adapter, run = defaultRun }, dir) {
  const env = adapter.gitEnv?.() ?? {};
  const git = (args, opts = {}) => cacheGit(dir, args, { run, env, ...opts });

  if (!existsSync(join(dir, "HEAD"))) {
    rmSync(dir, { recursive: true, force: true }); // a clone that died half way
    cacheGit(null, ["clone", "--bare", "--quiet", "--filter=blob:none", "--no-tags", "--single-branch", "--branch", info.defaultBranch, info.remoteUrl, dir], { run, env });
    for (const [k, v] of adapter.gitConfig ?? []) git(["config", "--add", k, v]);
  }
  git(["config", "remote.origin.url", info.remoteUrl]);
  git(["symbolic-ref", "HEAD", `refs/heads/${info.defaultBranch}`]);

  // Destination ref in the cache -> source ref on the host.
  const want = new Map([[`refs/heads/${info.defaultBranch}`, `refs/heads/${info.defaultBranch}`]]);
  for (const p of prs) {
    if (p.baseRefName) want.set(`refs/heads/${p.baseRefName}`, `refs/heads/${p.baseRefName}`);
    want.set(prRef(p.number), p.headRef);
  }
  const fetch = (pairs) => git(["fetch", "--quiet", "--no-tags", "--filter=blob:none", "origin", ...pairs.map(([dst, src]) => `+${src}:${dst}`)]);
  const failed = new Map();
  try { fetch([...want]); }
  catch {
    // One bad ref fails the whole fetch: retry one by one to find it.
    for (const [dst, src] of want) {
      try { fetch([[dst, src]]); }
      catch (e) {
        if (!dst.startsWith("refs/pr-triage/pr/")) throw new Error(`${entry.id}: could not fetch ${dst} — ${e.message}`);
        failed.set(Number(dst.split("/").pop()), e.message);
      }
    }
  }

  // Prune: refs of closed PRs and of branches no open PR targets any more.
  const unfetched = (ref) => ref.startsWith("refs/pr-triage/") && failed.has(Number(ref.split("/").pop()));
  const have = git(["for-each-ref", "--format=%(refname)", "refs/pr-triage/", "refs/heads/"]).split("\n").filter(Boolean);
  for (const ref of have) if (!want.has(ref) || unfetched(ref)) git(["update-ref", "-d", ref]);

  // Download every file at every head in one batch; git would otherwise fetch
  // each missing file on its own when a judge reads it.
  const tips = [...want.keys()].filter((ref) => !unfetched(ref));
  const missing = git(["rev-list", "--objects", "--missing=print", ...tips.map((t) => `${t}^{tree}`)])
    .split("\n").filter((l) => l.startsWith("?")).map((l) => l.slice(1));
  if (missing.length) {
    git(["-c", "fetch.negotiationAlgorithm=noop", "fetch", "--quiet", "--no-tags", "--no-write-fetch-head", "--recurse-submodules=no", "--filter=blob:none", "--stdin", "origin"],
      { input: missing.join("\n") + "\n" });
  }

  return {
    dir,
    failed,
    // A file at a ref, or null when it is not there.
    read(ref, path) {
      const r = run("git", ["--git-dir", dir, "show", `${ref}:${path}`], { env: gitEnv(env) });
      return r.ok ? r.stdout : null;
    },
  };
}

// Removes the whole cache, or one repo's. Refuses any path outside the cache
// root, and any cache a running pr-triage holds.
export function cleanCache({ entry, home } = {}) {
  const root = resolve(cacheRoot(home));
  const target = resolve(entry ? cacheDirOf(entry, home) : root);
  if (target !== root && !target.startsWith(root + sep)) throw new Error(`refusing to remove ${target}: not inside ${root}`);
  const locks = entry ? [lockDirOf(entry, home)] : heldLocks(locksRoot(home));
  for (const lock of locks) {
    const s = lockState(lock);
    if (!s.free && !s.stale) throw new Error(`a pr-triage run (pid ${s.pid ?? "?"}) is using this cache; run --clean-cache again when it ends`);
  }
  const existed = existsSync(target);
  rmSync(target, { recursive: true, force: true });
  return { target, existed };
}

// Every lock folder under the locks tree (a folder that holds a pid file).
function heldLocks(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true }).map(String)
    .filter((p) => p.endsWith(`${sep}pid`) && !p.startsWith(`.tmp${sep}`) && statSync(join(dir, p)).isFile())
    .map((p) => join(dir, dirname(p)));
}
