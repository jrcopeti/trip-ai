# `.github/pr-review.jsonc` — optional tuning

Neither skill needs this file. Without it, built-in defaults decide what is a
test, what is noise, and the reading order, and the model judges attention on
its own. Add the file only when the defaults get this repo wrong. It is JSON
with comments and trailing commas allowed. Nothing in it ranks PRs.

```jsonc
{
  "version": 1,

  // Named parts of THIS repo. Shown as tags on files and given to the model
  // as hints — a change in "money" is read with extra care. They never score.
  "areas": {
    "money":      ["src/domain/refund.ts", "src/payments/**"],
    "auth":       ["middleware.ts", "**/actions.ts"],
    "migrations": ["drizzle/**"]
  },

  // Extra test globs (common layouts are built in).
  "tests": [],

  // Extra noise globs (lockfiles, snapshots, dist/, *.min.* are built in).
  "noise": ["drizzle/meta/**"],

  "tour": {
    // Folders searched for a spec or review contract whose file name
    // contains the branch name (feat/gift-cards -> *gift-cards*.md).
    "specDirs": ["docs", "specs", ".scratch", "contracts"],
    // The order THIS team reads in; first match wins.
    "readingOrder": [
      { "name": "schema & migrations", "paths": ["drizzle/**", "src/db/schema.ts"] },
      { "name": "domain",              "paths": ["src/domain/**"] },
      { "name": "services & data",     "paths": ["src/services/**", "src/db/**"] },
      { "name": "UI",                  "paths": ["app/**", "components/**"] }
    ]
  }
}
```

Globs: `**` any depth, `*` within one folder, `?`, `{a,b}`. A glob without `/`
matches the file name anywhere (`"*.sql"`).

## `~/.config/pr-triage/repos.jsonc` — many repos (pr-triage only)

One list per user, in the home folder: `~/.config/pr-triage/repos.jsonc` on
macOS and Linux, `%USERPROFILE%\.config\pr-triage\repos.jsonc` on Windows.
No list: pr-triage triages the current repo. `triage.mjs --repo owner/name`
ignores the list.

```jsonc
{
  "repos": [
    "github:dmoka/ticket-bay", // github:<owner>/<repo>
    "github:dmoka/brain-demo", // private repos need read access for your gh login
  ],
}
```

- **Hosts:** GitHub only, through `gh`. `gitlab:` and `azure:` entries print
  "GitLab is not supported yet" / "Azure DevOps is not supported yet" and are
  skipped. Each repo's own `.github/pr-review.jsonc` is read from its default
  branch.
- **Login check** (pr-triage's `preflight.mjs`; `triage.mjs` prints the
  same table first), per repo and in order: `git` and `gh` installed (else
  the install link), `gh` logged in (else `gh auth login`; with a bad
  `GH_TOKEN`/`GITHUB_TOKEN`, "set but not valid"; offline, "network error:
  can't reach github.com"), the login can read the repo (else "not found —
  check the spelling; if it is private, your login can't read this repo; ask
  for read access": GitHub answers the same for both). Only `ready` repos
  are triaged. Nothing asks for a token, stores a credential or runs a login.
- **Code cache:** `~/.cache/pr-triage/github/<owner>/<repo>`, a bare clone
  with `--filter=blob:none`: no working tree, file contents only where needed.
  Each run fetches every open PR head (`refs/pull/<n>/head`) into
  `refs/pr-triage/pr/<n>` and each base branch and the default branch into
  `refs/heads/<branch>`, deletes the refs of closed PRs, and downloads the
  files at those heads in one batch, so judges read offline. Git borrows your
  `gh` login through `gh auth git-credential`; the cache stores no token. It
  never touches your checkouts. A broken cache is deleted and cloned again.
  One run at a time per repo: a run waits for another (a lock in
  `~/.cache/pr-triage/.locks`, taken over only when its process is gone).
  `triage.mjs --clean-cache [github:<owner>/<repo>]` deletes the cache, or
  one repo's; it refuses while a run uses it.
- **Keys:** a PR is `<owner>-<repo>-<number>` (`dmoka-ticket-bay-33`): its
  tour is `tour-<key>.json`, `triage.notes.json` orders keys, the page links
  `#/pr/<key>`.

## Built-in defaults

- **Tests:** `test/`, `tests/`, `__tests__/`, `spec/`, `e2e/`, `*.test.*`,
  `*.spec.*`, `*_test.go`, `test_*.py`, `*_test.py`, `*Test(s).java|kt|cs`.
- **Noise:** lockfiles (npm, yarn, pnpm, bun, Cargo, Poetry, uv, Go, Composer,
  Bundler, NuGet, Gradle, Nix), snapshots, `dist/`, `build/`, `*.min.*`,
  bundles and source maps, ORM snapshots (Drizzle `meta/*_snapshot.json` and
  `meta/_journal.json`, EF Core `*ModelSnapshot.cs` and `Migrations/*.Designer.cs`,
  Prisma `migration_lock.toml`), files whose first lines say `@generated`,
  `DO NOT EDIT`, `auto-generated` or `this file was generated`, binaries, pure
  renames, and four heuristics: **formatting only** (the change disappears once
  whitespace, quotes, commas, semicolons and parentheses are ignored),
  **imports only**, **minified or bundled** (a `.js`/`.css`/`.json`/`.svg` line
  over 1000 characters, or 200 on average) and **large JSON** (500+ added lines,
  except hand-edited manifests such as `package.json` and `tsconfig.json`).
  Noise never goes on the ASK WHY list and is never part of the intent map.
- **Reading order:** contracts & schema → domain → services & data → UI &
  entry points → config & scripts → everything else. Hotspots (any file with
  a high-severity item, together with its tests) jump to the front.

## Report JSON

Both reports carry `kind` (`"triage"` or `"tour"`) and `schemaVersion: 1`.

**triage.json** — `repo`, `generatedAt`, `ranking`, `summary` (model), and
`prs[]` in queue order: `rank`, `attention` (copied from the PR's tour),
`number`, `title`, `url`, `author`, `draft`, `labels`, `ageDays`,
`additions`, `deletions`, `filesChanged`, `readLines`, `noiseLines`,
`noiseFiles`, `intent`, `highFacts[]`, and `tour` (the file name of its tour). Every PR has a `key`:
its number for one repo, `<repo slug>-<number>` for many. With a repo list,
`repo` is null, each PR also carries `repo` (`owner/name`) and `repoId`
(`github:owner/name`), `repos[]` lists every listed repo (`id`, `host`,
`path`, `slug`, `ready`, `status`, `open`, `skipped[]` of `{ number, reason }`,
`cache`), and each `overlaps[]` entry names its `repo`.

**tour-<key>.json** — `pr` (metadata), with a repo list also `host` and
`read` (`gitDir`, `base`, `head`, and the `diff`, `show`, `grep` commands a
judge reads the PR with), `attention` (model: `level`: `critical` |
`high` | `medium` | `low`, `whatHappened`, `why`, `file`, `line`, `side`),
`intent` (`status`: `spec` | `described` | `title only` | `UNKNOWN`,
`sources[]` of `{ type: spec | description | issue | commits | title, source,
text }`, strongest first), `explains[]` (model: `quote`, `files`),
`unexplained[]` (derived: non-noise files no quote explains; a test inherits
its code's explanation), `unmatched[]` (derived: quotes with no file),
`whatItDoes` (model), `claims[]` (`quote`, `file`, `line`, `note`), `items[]`
(`source`: `fact` | `model` | `map`, `kind`, `severity`, `file`, `line`,
`side`, `text`, `why`), `fileNotes`, `order[]` (`path`, `role`: `code` |
`test` | `noise`, `pairedWith`, `why`), `orderRule`, and `files[]` (`path`,
`oldPath`, `status`, `kind`, `noise`, `areas`, `additions`, `deletions`,
`hunks[]` with `lines[]` of `{ t: "add"|"del"|"ctx", s, o, n }`), `changeMap`
(computed: `nodes[]` of `{ path, layer }`, `edges[]` of `{ from, to }`, or
null), `diagrams[]` (model: `title`, `kind`, `mermaid`, `caption`), plus the
model's `why`, `points[]`, `shape[]` (`title`, `kind`, `lang`, `code`) and
`chapters[]` (`title`, `description`, `files`, tests placed after their code).

## In CI

The deterministic half needs no model: `triage.mjs` (or, in pr-tour, `tour.mjs`), then
`render.mjs`, gives the queue and every tour with facts, noise, and reading
order — attention shows "not judged" and the WHY panel "not annotated yet".
Upload `.pr-review/review.html` as the build artifact: one file with the
queue and every tour. Add the model step only where an agent runs in the
pipeline.
