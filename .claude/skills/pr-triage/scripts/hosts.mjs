// Host adapters for many repos. GitHub only for now, through `gh`. An adapter
// lists the open PRs with their text, names the git refs that hold each PR
// head, and lends git the login the user already has. Code itself is read
// from the cache (cache.mjs), not here.
//
// adapter.info()          -> { defaultBranch, remoteUrl, webUrl }
// adapter.listOpen(limit) -> PR metadata in `gh pr view --json` shape, plus
//                            headRef: the ref on the host that holds the PR head
// adapter.readIssue(n)    -> { number, title, body }
// adapter.gitEnv()        -> env for git fetches (the credential, never written to disk)
// adapter.gitConfig       -> config written into the cache, so later reads can fetch

import { run as defaultRun, firstLine } from "./repos.mjs";

// Config passed to git through the environment: it applies to this command
// only and is never written to a file.
export function gitConfigEnv(pairs) {
  const env = { GIT_CONFIG_COUNT: String(pairs.length) };
  pairs.forEach(([k, v], i) => { env[`GIT_CONFIG_KEY_${i}`] = k; env[`GIT_CONFIG_VALUE_${i}`] = v; });
  return env;
}

export function adapterFor(entry, { run = defaultRun } = {}) {
  const json = (cmd, args) => {
    const r = run(cmd, args);
    if (!r.ok) throw new Error(`${cmd} ${args.slice(0, 3).join(" ")} failed: ${firstLine(r.stderr) || `exit ${r.code}`}`);
    return JSON.parse(r.stdout);
  };
  if (entry.host === "github") return github(entry.path, json);
  throw new Error(`${entry.id}: no adapter for host "${entry.host}"`);
}

function github(repo, json) {
  // gh is the credential helper: git asks it for the login it already has.
  const helper = [["credential.https://github.com.helper", ""], ["credential.https://github.com.helper", "!gh auth git-credential"]];
  return {
    info() {
      const r = json("gh", ["repo", "view", repo, "--json", "defaultBranchRef,url"]);
      return { defaultBranch: r.defaultBranchRef?.name, remoteUrl: `https://github.com/${repo}.git`, webUrl: r.url };
    },
    listOpen(limit = 100) {
      const fields = "number,title,body,author,url,baseRefName,headRefName,headRefOid,createdAt,isDraft,labels,closingIssuesReferences";
      return json("gh", ["pr", "list", "--repo", repo, "--state", "open", "--limit", String(limit), "--json", fields])
        // refs/pull/<n>/head exists for every PR, forks included.
        .map((p) => ({ ...p, headRef: `refs/pull/${p.number}/head` }));
    },
    readIssue(n) { return json("gh", ["issue", "view", String(n), "--repo", repo, "--json", "number,title,body"]); },
    gitEnv: () => gitConfigEnv(helper),
    gitConfig: helper,
  };
}
