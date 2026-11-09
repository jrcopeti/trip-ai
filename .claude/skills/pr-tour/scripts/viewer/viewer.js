// PR review viewer: builds the queue and every tour from the JSON embedded in
// the page. Plain JavaScript, no dependencies, no network. The page adds no
// facts; it is a view of triage.json and tour-<n>.json.
// Source of truth: shared/viewer/viewer.js in github.com/dmoka/skills.
(() => {
  "use strict";

  const DATA = JSON.parse(document.getElementById("data").textContent);
  const app = document.getElementById("app");
  const LEVELS = ["critical", "high", "medium", "low"];
  const SEV = { high: 0, medium: 1, low: 2 };

  // ---------- text ----------
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const fmt = (n) => Number(n || 0).toLocaleString("en");
  const age = (d) => (d == null ? "—" : d === 0 ? "today" : `${d}d`);
  const when = (iso) => (iso ? new Date(iso).toISOString().replace("T", " ").slice(0, 16) + " UTC" : "");
  const base = (p) => String(p).split("/").pop();
  const short = (p) => String(p).split("/").slice(-2).join("/");

  // Inline markdown: `code`, **bold**, [keyword](path[:line]) links.
  function inline(s, link) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/\[([^\]]+)\]\(((?:[^()]|\([^()]*\))+)\)/g, (m, text, target) => {
        const href = link ? link(target.replace(/&amp;/g, "&")) : null;
        return href ? `<a class="kw" href="${href}">${text}</a>` : text;
      });
  }
  // Block markdown: paragraphs and "- " bullets.
  function block(s, link) {
    const out = [];
    let list = null;
    for (const raw of String(s ?? "").split("\n")) {
      const line = raw.trim();
      if (/^[-*] /.test(line)) { (list ??= []).push(`<li>${inline(line.slice(2), link)}</li>`); continue; }
      if (list) { out.push(`<ul>${list.join("")}</ul>`); list = null; }
      if (line) out.push(`<p>${inline(line, link)}</p>`);
    }
    if (list) out.push(`<ul>${list.join("")}</ul>`);
    return out.join("");
  }

  // ---------- syntax highlight (tiny, per line) ----------
  const KW = {
    js: "abstract as async await break case catch class const continue debugger default delete do else enum export extends false finally for from function get if implements import in instanceof interface let new null of private protected public readonly return satisfies set static super switch this throw true try type typeof undefined var void while with yield",
    py: "and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return self True try while with yield",
    sql: "add alter and as begin by cascade check column commit constraint create default delete desc distinct drop exists foreign from group having if in index insert into is join key left limit not null on or order primary references rename select set table to transaction truncate unique update using values where",
    go: "break case chan const continue default defer else fallthrough for func go goto if import interface map nil package range return select struct switch type var true false",
    generic: "if else for while return class function def fn let const var true false null nil new public private static import package use struct enum match impl pub mut",
  };
  const kwSets = Object.fromEntries(Object.entries(KW).map(([k, v]) => [k, new Set(v.split(" "))]));
  function langOf(path) {
    const ext = (String(path).split(".").pop() || "").toLowerCase();
    if (["ts", "tsx", "js", "jsx", "mjs", "cjs", "vue", "svelte"].includes(ext)) return "js";
    if (ext === "py") return "py";
    if (ext === "sql") return "sql";
    if (ext === "go") return "go";
    if (["json", "jsonc"].includes(ext)) return "json";
    if (["css", "scss"].includes(ext)) return "css";
    if (["md", "txt", "lock", "yaml", "yml", "toml"].includes(ext)) return "plain";
    return "generic";
  }
  function highlight(line, lang) {
    if (lang === "plain" || line.length > 400) return esc(line);
    const comment = lang === "py" ? /^#.*/ : lang === "sql" ? /^--.*/ : /^\/\/.*|^\/\*.*?(\*\/|$)/;
    const kws = kwSets[lang] ?? (lang === "json" || lang === "css" ? new Set() : kwSets.generic);
    const ci = lang === "sql";
    let out = "", i = 0, m;
    while (i < line.length) {
      const rest = line.slice(i);
      if ((m = rest.match(comment))) { out += `<span class="hl-c">${esc(m[0])}</span>`; i += m[0].length; continue; }
      if ((m = rest.match(/^("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|`(?:[^`\\]|\\.)*`?)/))) {
        const isKey = lang === "json" && /^\s*:/.test(line.slice(i + m[0].length));
        out += `<span class="${isKey ? "hl-p" : "hl-s"}">${esc(m[0])}</span>`; i += m[0].length; continue;
      }
      if ((m = rest.match(/^\b\d[\d_]*(\.\d+)?([eE][+-]?\d+)?n?\b/))) { out += `<span class="hl-n">${esc(m[0])}</span>`; i += m[0].length; continue; }
      if ((m = rest.match(/^[A-Za-z_$][\w$]*/))) {
        const w = m[0];
        if (kws.has(ci ? w.toLowerCase() : w)) out += `<span class="hl-k">${esc(w)}</span>`;
        else if (/^[A-Z][A-Za-z0-9]*$/.test(w) && lang !== "sql") out += `<span class="hl-t">${esc(w)}</span>`;
        else if (line[i + w.length] === "(") out += `<span class="hl-f">${esc(w)}</span>`;
        else out += esc(w);
        i += w.length; continue;
      }
      out += esc(line[i]); i++;
    }
    return out;
  }

  // ---------- badges ----------
  const att = (lvl) => (lvl ? `<span class="att att-${esc(lvl)}">${esc(lvl)}</span>` : `<span class="att att-none">not judged</span>`);
  const sev = (s) => `<span class="sev sev-${esc(s)}">${esc(s)}</span>`;
  const src = (s) => (s === "fact" ? `<span class="tag tag-fact" title="Computed by a script from the diff">FACT</span>`
    : s === "map" ? `<span class="tag tag-ask" title="Nothing the author wrote explains this file">ASK WHY</span>`
    : `<span class="tag tag-model" title="Written by the model; file and line checked by the gate">LOOK HERE</span>`);
  const MODEL = `<span class="tag tag-model">MODEL</span>`;

  // ---------- routing ----------
  // #/            the queue (or the only tour)
  // #/pr/9        a tour
  // #/pr/9?at=x   a tour, scrolled to element x
  const tourKeys = Object.keys(DATA.tours ?? {});
  let current = null;
  function parse() {
    const m = location.hash.match(/^#\/pr\/([^?]+)(?:\?at=(.+))?$/);
    if (m) return { pr: decodeURIComponent(m[1]), at: m[2] ? decodeURIComponent(m[2]) : null };
    if (!DATA.triage && tourKeys.length) return { pr: tourKeys[0], at: null };
    return { pr: null, at: null };
  }
  function route() {
    const r = parse();
    const key = r.pr ? `pr:${r.pr}` : "queue";
    if (key !== current) {
      current = key;
      if (r.pr && DATA.tours?.[r.pr]) app.innerHTML = renderTour(DATA.tours[r.pr], r.pr);
      else app.innerHTML = DATA.triage ? renderQueue(DATA.triage) : `<div class="main"><p class="empty">Nothing to show.</p></div>`;
      const tour = r.pr && DATA.tours?.[r.pr];
      document.title = tour ? `${tour.read ? `${tour.repo}` : ""}#${tour.pr.number} · ${tour.pr.title}` : `Triage · ${repoLabel(DATA.triage)}`;
      wire();
      if (!r.at) window.scrollTo(0, 0);
    }
    if (r.at) jump(r.at);
  }
  function jump(id) {
    const el = document.getElementById(id);
    if (!el) return;
    for (let d = el.closest("details"); d; d = d.parentElement?.closest("details")) d.open = true;
    el.scrollIntoView({ block: /-[no]\d+$/.test(id) ? "center" : "start" });
    if (el.tagName === "TR") { el.classList.add("pulse"); setTimeout(() => el.classList.remove("pulse"), 1600); }
  }
  window.addEventListener("hashchange", route);

  // ---------- queue ----------
  // One repo: a PR is keyed by its number. Many repos: by "<repo slug>-<number>",
  // and each row carries its repo.
  const keyOf = (p) => String(p.key ?? p.number);
  const prHref = (p) => `#/pr/${encodeURIComponent(keyOf(p))}`;
  // Many repos: count the triaged ones; the others are counted apart.
  const repoLabel = (t) => {
    if (t?.repo || !t?.repos) return t?.repo ?? "";
    const off = t.repos.filter((r) => !r.ready).length;
    return plural(t.repos.length - off, "repo") + (off ? ` · ${off} not triaged` : "");
  };
  let repoFilter = "";
  function renderQueue(t) {
    const prs = t.prs;
    const judged = prs.filter((p) => p.attention).length;
    const count = (lvl) => prs.filter((p) => p.attention?.level === lvl).length;
    const at = (p, file, line, side) => {
      const tour = DATA.tours?.[keyOf(p)];
      const i = tour ? tour.order.findIndex((o) => o.path === file) : -1;
      return i < 0 ? prHref(p) : `${prHref(p)}?at=f${i}${line != null ? (side === "old" ? "-o" : "-n") + line : ""}`;
    };
    const rows = prs.map((p, i) => {
      const a = p.attention;
      const has = !!DATA.tours?.[keyOf(p)];
      return `<tr${has ? ` class="qrow" tabindex="0" data-href="${prHref(p)}" aria-label="Open the tour of #${p.number}"` : ""}${p.repo ? ` data-repo="${esc(p.repo)}"` : ""}${repoFilter && p.repo !== repoFilter ? " hidden" : ""}>
  <td class="rank r">${p.rank ?? i + 1}</td>
  <td>${att(a?.level)}</td>
  <td>
    <div class="title">${p.repo ? `<span class="pill repo" title="${esc(p.repoId ?? p.repo)}">${esc(p.repo)}</span>` : ""}<a href="${has ? prHref(p) : esc(p.url)}">${esc(p.title)}</a><a class="n" href="${esc(p.url)}">#${p.number}</a><span class="n" style="font-family:var(--sans)">${esc(p.author ?? "")}</span>${p.draft ? ` <span class="pill">draft</span>` : ""}${(p.labels ?? []).map((l) => ` <span class="pill">${esc(l)}</span>`).join("")}</div>
    ${a ? `<div class="model what">${inline(a.whatHappened)}</div><div class="whyline">${inline(a.why)}${a.file ? ` <a class="mono ev" href="${at(p, a.file, a.line, a.side)}">${esc(base(a.file))}${a.line != null ? ":" + a.line : ""}</a>` : ""}</div>` : ""}
    ${p.highFacts?.length ? `<div class="facts">${p.highFacts.slice(0, 3).map((f) => `<div>${inline(f.text)} <a class="mono" style="color:var(--dim)" href="${at(p, f.file, f.line, f.side)}">${esc(base(f.file))}${f.line ? ":" + f.line : ""}</a></div>`).join("")}</div>` : ""}
  </td>
  <td class="r num">${fmt(p.readLines)}<div style="color:var(--dim);white-space:nowrap">${p.noiseLines ? `+${fmt(p.noiseLines)} noise` : plural(p.filesChanged, "file")}</div></td>
  <td class="r num">${age(p.ageDays)}</td>
  <td class="r">${has ? `<a class="go go-tour" href="${prHref(p)}">Tour →</a>` : ""}</td>
</tr>`;
    }).join("");
    const byKey = new Map(prs.map((p) => [keyOf(p), p]));
    const chip = (k) => { const p = byKey.get(String(k)); return `<a class="fchip" href="#/pr/${encodeURIComponent(k)}">${p?.repo ? esc(p.repo.split("/").pop()) : ""}#${esc(p?.number ?? k)}</a>`; };
    const overlaps = (t.overlaps ?? []).length ? `
<section class="sec"><div class="sec-h">PRs that change the same files <span class="count">merge order matters</span></div>
<div class="box"><table><tbody>${t.overlaps.slice(0, 12).map((o) => `<tr><td class="mono" style="width:55%">${o.repo ? `<span class="pill">${esc(o.repo)}</span> ` : ""}${esc(o.file)}</td><td>${o.prs.map(chip).join(" ")}</td></tr>`).join("")}${t.overlaps.length > 12 ? `<tr><td colspan="2" class="empty">+${t.overlaps.length - 12} more files</td></tr>` : ""}</tbody></table></div></section>` : "";
    // Many repos: the ones the login check stopped, and PRs that could not be read, go first.
    const blocked = (t.repos ?? []).filter((r) => !r.ready || r.skipped?.length);
    const notTriaged = blocked.length ? `
<section class="sec"><div class="sec-h">Not triaged <span class="count">fix these, then run again</span></div>
<div class="box"><table><tbody>${blocked.map((r) => `<tr><td class="mono" style="width:34%">${esc(r.id)}</td><td>${r.ready ? `${plural(r.skipped.length, "PR")} skipped: ${r.skipped.map((s) => `#${esc(s.number)} ${esc(s.reason)}`).join("; ")}` : esc(r.status)}</td></tr>`).join("")}</tbody></table></div></section>` : "";
    const shown = (t.repos ?? []).filter((r) => r.ready && r.path);
    const filter = shown.length > 1 ? `<label class="rfilter">Repo <select id="repo-filter"><option value="">All ${shown.length} repos</option>${shown.map((r) => `<option value="${esc(r.path)}"${r.path === repoFilter ? " selected" : ""}>${esc(r.path)} (${r.open})</option>`).join("")}</select></label>` : "";
    return `
<header class="topbar"><span class="mark"><i></i>PR Triage</span><span class="sep">/</span><span class="mono meta">${esc(repoLabel(t))}</span><span class="grow"></span><span class="meta hide-sm">${esc(when(t.generatedAt))}</span></header>
<main class="main" style="max-width:1240px;margin:0 auto">
<section class="sec">
<h1 style="margin-top:4px">What needs your attention first</h1>
<div class="sub">${judged === prs.length ? "Every open PR was read and judged by the model; each reason links to the line that drives it." : `${judged} of ${prs.length} PRs judged so far — the rest are listed by number.`}</div>
<div class="box strip">
  <div><div class="k">Open PRs</div><div class="v">${prs.length}<small>${prs.filter((p) => p.draft).length} draft</small></div></div>
  <div><div class="k">Critical</div><div class="v" style="color:${count("critical") ? "var(--red)" : "inherit"}">${count("critical")}</div></div>
  <div><div class="k">High</div><div class="v" style="color:${count("high") ? "var(--red)" : "inherit"}">${count("high")}</div></div>
  <div><div class="k">Lines to read</div><div class="v">${fmt(prs.reduce((s, p) => s + p.readLines, 0))}</div></div>
  <div><div class="k">Noise, collapsed</div><div class="v">${fmt(prs.reduce((s, p) => s + p.noiseLines, 0))}<small>lines</small></div></div>
</div></section>
${t.summary ? `<section class="sec"><div class="sec-h">Summary ${MODEL}</div><div class="model">${inline(t.summary)}</div></section>` : ""}
${notTriaged}
<section class="sec"><div class="sec-h">Queue <span class="count">${prs.length} · most attention first</span>${filter}</div>
<div class="box"><table>
<thead><tr><th class="r">#</th><th>Attention</th><th>Pull request · what happened · why</th><th class="r">To read</th><th class="r">Age</th><th></th></tr></thead>
<tbody>${rows}</tbody></table></div></section>
${overlaps}
<div class="footer"><span>Attention is the model's judgement after reading each PR. Blue text is the model's; red dots are facts a script computed from the diff.</span><span>An order to read in — never a verdict. The last PR still gets read.</span></div>
</main>`;
  }

  // ---------- tour ----------
  function renderTour(r, key) {
    const pr = r.pr;
    const files = new Map(r.files.map((f) => [f.path, f]));
    const idx = new Map(r.order.map((o, i) => [o.path, i]));
    const role = new Map(r.order.map((o) => [o.path, o]));
    const href = (id) => `#/pr/${encodeURIComponent(key)}?at=${encodeURIComponent(id)}`;
    const anchor = (path, line, side) => href(`f${idx.get(path)}${line != null ? (side === "old" ? "-o" : "-n") + line : ""}`);
    const loc = (path, line, side) => `<a class="mono" href="${anchor(path, line, side)}">${esc(base(path))}${line != null ? ":" + line : ""}</a>`;
    const link = (target) => { const [p, l] = target.split(/:(\d+)$/); return idx.has(p) ? anchor(p, l ? Number(l) : null) : null; };
    const SRC = { model: 0, map: 1, fact: 2 };
    const items = [...r.items].sort((a, b) => SEV[a.severity] - SEV[b.severity] || SRC[a.source] - SRC[b.source]);
    const worst = (p) => items.filter((x) => x.file === p).reduce((w, x) => Math.min(w, SEV[x.severity]), 9);
    const nonNoise = r.order.filter((o) => o.role !== "noise");
    const noise = r.order.filter((o) => o.role === "noise");
    const lines = (list) => list.reduce((s, o) => s + files.get(o.path).additions + files.get(o.path).deletions, 0);
    const readLines = lines(nonNoise), noiseLines = lines(noise);

    // Chapters: the judge's, or a deterministic fallback from the reading order.
    let chapters = r.chapters?.length ? r.chapters : null;
    if (!chapters) {
      const hot = nonNoise.filter((o) => o.why.startsWith("hotspot") || (o.role === "test" && nonNoise.find((x) => x.path === o.pairedWith)?.why.startsWith("hotspot")));
      const rest = nonNoise.filter((o) => !hot.includes(o));
      chapters = [
        hot.length && { title: "Start here", description: "Files with a high-severity finding, each followed by its tests.", files: hot.map((o) => o.path) },
        rest.length && { title: hot.length ? "The rest" : "Files", description: "Contracts and schema first, then domain, services, and UI; each test right after its code.", files: rest.map((o) => o.path) },
      ].filter(Boolean);
    }
    const label = new Map();
    chapters.forEach((c, ci) => c.files.forEach((p, fi) => label.set(p, `${ci + 1}${String.fromCharCode(97 + Math.min(fi, 25))}`)));

    // --- TL;DR ---
    const a = r.attention;
    const strongest = r.intent.sources.find((s) => s.type !== "title") ?? r.intent.sources[0];
    const lead = strongest ? (strongest.text.split(/(?<=[.!?])\s+/)[0] || strongest.text).slice(0, 240) : null;
    const whyRow = r.why ? `<q>${inline(r.why)}</q><span class="src-note">the author's words</span>`
      : r.intent.status === "UNKNOWN" ? `<span class="unk">No stated reason — no description, issue, or informative title. Ask the author before you read the code.</span>`
      : `<q>${inline(lead)}</q><span class="src-note">${esc(strongest.source)}</span>`;
    const unexplained = r.unexplained ?? [];
    const tldr = `
<section class="sec" id="tldr"><div class="box tldr">
  <div class="tl-head"><span class="tl-tag">TL;DR</span><h1>${inline(a?.whatHappened ?? pr.title)}</h1></div>
  <dl class="tl-rows">
    <dt>What</dt><dd>${r.whatItDoes ? `${inline(r.whatItDoes, link)} ${MODEL}` : `<span class="empty">Not annotated yet.</span>`}</dd>
    <dt>Why</dt><dd>${whyRow}</dd>
    <dt>Attention</dt><dd>${a ? `${att(a.level)} ${inline(a.why)}${a.file ? ` <a class="mono" style="color:var(--blue)" href="${anchor(a.file, a.line, a.side)}">${esc(base(a.file))}${a.line != null ? ":" + a.line : ""}</a>` : ""}` : `<span class="empty">Not judged.</span>`}</dd>
    <dt>Size</dt><dd><span class="num">${fmt(readLines)}</span> lines to read in ${plural(nonNoise.length, "file")}${noise.length ? ` · <span class="num">${fmt(noiseLines)}</span> lines of noise collapsed (${esc([...new Set(noise.map((n) => n.why))].join(", "))})` : ""}</dd>
    <dt>Intent</dt><dd>${r.intent.status === "UNKNOWN" ? `<span class="unk">UNKNOWN</span>` : esc(r.intent.status)}${unexplained.length ? ` · <span style="color:var(--amber)">${plural(unexplained.length, "file")} nothing the author wrote explains:</span> ${unexplained.map((p) => `<a class="fchip warn" href="${anchor(p)}">${esc(base(p))}</a>`).join(" ")}` : r.whatItDoes ? " · every changed file is explained by the author's words" : ""}</dd>
  </dl>
</div></section>`;

    const overview = r.points?.length ? `
<section class="sec" id="overview"><div class="sec-h">Overview ${MODEL}</div><ol class="points">${r.points.map((p) => `<li><span>${inline(p, link)}</span></li>`).join("")}</ol></section>` : "";

    const shapeView = (v) => {
      const body = String(v.code).split("\n").map((l) => {
        if (v.lang === "diff") {
          const cls = l.startsWith("+") ? "add" : l.startsWith("-") ? "del" : "";
          return `<span class="ln ${cls}">${esc(l)}</span>`;
        }
        return `<span class="ln">${highlight(l, v.lang === "sql" ? "sql" : v.lang === "text" ? "plain" : "js")}</span>`;
      }).join("");
      return `<div class="box"><div class="shape-h">${esc(v.title)} <span class="tag tag-src">${esc(v.kind)}</span><span class="grow"></span>${MODEL}</div><pre>${body}</pre></div>`;
    };
    const diagramView = (d) => `<div class="box dgm-box"><div class="shape-h">${esc(d.title)} <span class="tag tag-src">${esc(d.kind)}</span><span class="grow"></span>${MODEL}</div>${d.svg ? `<div class="dgm">${d.svg}</div>` : `<pre class="dgm-fail">${esc(d.mermaid)}</pre>`}${d.caption ? `<div class="dgm-cap">${inline(d.caption, link)}</div>` : ""}</div>`;
    const views = [...(r.diagramsSvg ?? []).map(diagramView), ...(r.shape ?? []).map(shapeView)];
    const shape = views.length ? `
<section class="sec" id="shape"><div class="sec-h">Shape of the change <span class="count">structure before code</span></div><div class="shape">${views.join("")}</div></section>` : "";
    const cm = r.changeMapSvg;
    const changeMap = cm?.svg ? `
<section class="sec" id="map"><div class="sec-h">Where it fits <span class="count">changed files and which uses which · computed from the imports at the PR head · click a file to open it</span></div>
<div class="box dgm-box"><div class="dgm cmap" data-links="${esc(JSON.stringify(Object.fromEntries(Object.entries(cm.links).map(([label, p]) => [label, anchor(p)]))))}">${cm.svg}</div>
<div class="dgm-cap legend"><span><i class="lg lg-hot"></i>high finding</span><span><i class="lg lg-warn"></i>medium finding</span><span><i class="lg lg-test"></i>test</span><span>arrow = uses</span></div></div></section>` : "";

    // --- where to look ---
    const itemRow = (it) => `<div class="item"><div>${sev(it.severity)}</div><div>${src(it.source)}</div><div><div>${inline(it.text)} ${it.file ? `<span class="sep">·</span> ${loc(it.file, it.line, it.side)}` : ""}</div>${it.why ? `<div class="why-t">${inline(it.why)}</div>` : ""}</div></div>`;
    const major = items.filter((it) => it.severity !== "low"), minor = items.filter((it) => it.severity === "low");
    const look = `
<section class="sec" id="look"><div class="sec-h">Where to look <span class="count">${plural(items.length, "item")} · FACT = computed from the diff · LOOK HERE = model, line-checked · ASK WHY = no stated reason</span></div>
<div class="box" style="padding:14px 16px"><div class="items">${!items.length ? `<div class="empty">No facts and no LOOK HERE items.</div>` : major.map(itemRow).join("") + (minor.length ? `<details class="more" style="margin:${major.length ? "4px" : "0"} -12px -6px"><summary><span class="caret">▸</span> ${plural(minor.length, "low-severity item")}</summary><div style="padding:0 12px">${minor.map(itemRow).join("")}</div></details>` : "")}</div></div></section>`;

    // --- evidence: the author's words, intent map, claims ---
    const TYPE = { spec: "SPEC", description: "DESCRIPTION", issue: "ISSUE", commits: "COMMITS", title: "TITLE" };
    const srcBlock = (x) => {
      const head = `<div class="src"><span class="tag tag-src">${TYPE[x.type] ?? esc(x.type)}</span> ${esc(x.source)}</div>`;
      const long = x.text.split("\n").length > 10 || x.text.length > 700;
      return long ? `<details class="more" style="margin:0 -12px"><summary>${head.replace('class="src"', 'class="src" style="display:inline-block;margin:0 0 0 12px"')} <span class="caret">▸</span></summary><div class="quote" style="margin:0 12px 6px">${esc(x.text)}</div></details>` : `${head}<div class="quote">${esc(x.text)}</div>`;
    };
    const chip = (p, cls = "") => `<a class="fchip ${cls || (files.get(p)?.kind === "noise" ? "dim" : "")}" href="${anchor(p)}" title="${esc(p)}">${esc(base(p))}</a>`;
    const allNoise = r.files.every((f) => f.kind === "noise");
    const imap = !r.whatItDoes ? `<div class="empty">Not annotated yet.</div>` : [
      ...(r.explains ?? []).filter((e) => e.files.length).map((e) => `<div class="imap"><div><q>${inline(e.quote)}</q></div><div class="files">${e.files.map((p) => chip(p)).join("")}</div></div>`),
      unexplained.length ? `<div class="imap-h">Not explained by anything the author wrote — ask why</div><div class="imap"><div style="color:var(--mfg)">${plural(unexplained.length, "file")} with no stated reason</div><div class="files">${unexplained.map((p) => chip(p, files.get(p)?.areas?.length ? "bad" : "warn")).join("")}</div></div>`
        : `<div class="imap-h">${allNoise ? "Every change is noise — nothing needs a reason." : "Every changed file is explained by the author's words."}</div>`,
      (r.unmatched ?? []).length ? `<div class="imap-h">Stated, but not visible in this diff</div>${r.unmatched.map((q) => `<div class="imap"><div><q>${inline(q)}</q></div><div class="files"><span class="empty">no matching change</span></div></div>`).join("")}` : "",
    ].join("");
    const claims = (r.claims ?? []).map((c) => `<div class="claim"><q>${inline(c.quote)}</q>${c.file ? ` <span class="sep">→</span> check at ${loc(c.file, c.line, c.side)}` : ""}${c.note ? `<div class="note">${inline(c.note)}</div>` : ""}</div>`).join("");
    const evidence = `
<section class="sec" id="evidence"><div class="sec-h">Intent and evidence</div><div class="box ev-grid">
  <section><h3>The author's words</h3>${r.intent.status === "UNKNOWN" ? `<p class="unk" style="margin:0 0 8px">No stated intent — ask the author first.</p>` : ""}${r.intent.sources.map(srcBlock).join("<div style='height:10px'></div>")}</section>
  <section><h3>Intent map ${MODEL}</h3>${imap}</section>
  ${claims ? `<section class="full"><h3>Claims to check</h3>${claims}</section>` : ""}
</div></section>`;

    // --- walkthrough ---
    const fileCard = (p, open) => {
      const f = files.get(p), o = role.get(p), i = idx.get(p);
      const note = r.fileNotes?.[p];
      const flagged = items.some((x) => x.file === p && x.line != null && x.severity !== "low");
      const total = f.hunks.reduce((s, h) => s + h.lines.length, 0);
      return `<article class="box file ${o.role === "test" ? "test" : ""}" id="f${i}">
  <div class="fh"><span class="step">${esc(label.get(p) ?? "")}</span><span class="path">${esc(p)}</span>${f.status === "renamed" ? `<span class="old">← ${esc(f.oldPath)}</span>` : ""}${f.status === "added" ? `<span class="pill">new</span>` : f.status === "deleted" ? `<span class="pill">deleted</span>` : ""}${(f.areas ?? []).map((x) => `<span class="pill">${esc(x)}</span>`).join("")}<span class="grow"></span><span class="pos hide-sm">${o.role === "test" && o.pairedWith ? `test for <span class="mono">${esc(base(o.pairedWith))}</span>` : ""}</span><span class="num"><span class="plus">+${f.additions}</span> <span class="minus">−${f.deletions}</span></span></div>
  ${note ? `<div class="fnote-md">${MODEL.replace('class="tag', 'class="mtag tag')}${block(note, link)}</div>` : ""}
  <details class="codefold"${open || flagged ? " open" : ""}><summary><span class="caret">▸</span> View changes · ${fmt(total)} lines</summary>${diffTable(f, i, items)}</details>
</article>`;
    };
    const walkthrough = chapters.map((c, ci) => `
<section class="chapter" id="ch${ci + 1}">
  <div class="ch-head"><span class="ch-num">${ci + 1}</span><h2>${inline(c.title)}</h2>${r.chapters?.length ? MODEL : ""}</div>
  ${c.description ? `<p class="ch-desc">${inline(c.description, link)}</p>` : ""}
  ${c.files.map((p) => fileCard(p, ci === 0)).join("")}
</section>`).join("");
    const noiseBlock = noise.length ? `
<section class="sec" id="noise"><div class="sec-h">Noise <span class="count">${plural(noise.length, "file")} · ${fmt(noiseLines)} lines · collapsed because they carry little reading value — not because anyone checked them</span></div>
<div class="box noise">${noise.map((o) => { const f = files.get(o.path); return `<details class="row" id="f${idx.get(o.path)}"><summary><span class="caret">▸</span><span class="p">${esc(o.path)}${f.oldPath && f.oldPath !== f.path ? ` <span style="color:var(--dim)">← ${esc(f.oldPath)}</span>` : ""}</span><span class="pill">${esc(o.why)}</span><span class="num r"><span class="plus">+${f.additions}</span> <span class="minus">−${f.deletions}</span></span></summary>${diffTable(f, idx.get(o.path), items, 400)}</details>`; }).join("")}</div></section>` : "";

    // --- sidebar ---
    const out = (id, num, text, cls = "") => `<li class="${cls}"><a href="${href(id)}" data-target="${id}"><span class="o-num">${num}</span><span class="o-txt">${text}</span><span></span></a></li>`;
    const outline = [
      out("tldr", "—", "TL;DR"),
      overview && out("overview", "—", "Overview"),
      changeMap && out("map", "—", "Where it fits"),
      shape && out("shape", "—", "Shape of the change"),
      out("look", "—", `Where to look <span style="color:var(--dim)">${major.length}</span>`),
      out("evidence", "—", "Intent and evidence"),
      ...chapters.flatMap((c, ci) => [out(`ch${ci + 1}`, ci + 1, inline(c.title), "chap"), ...c.files.map((p) => out(`f${idx.get(p)}`, label.get(p), esc(base(p)), "sub"))]),
      noise.length && out("noise", "…", `Noise <span style="color:var(--dim)">${noise.length}</span>`),
    ].filter(Boolean).join("");
    const ST = { added: "A", deleted: "D", renamed: "R", modified: "M" };
    const flist = r.order.map((o) => {
      const f = files.get(o.path), w = worst(o.path);
      return `<li><a class="${o.role === "noise" ? "noise" : ""}" href="${anchor(o.path)}" title="${esc(o.path)}"><span class="st st-${ST[f.status] ?? "M"}">${ST[f.status] ?? "M"}</span><span class="nm">${esc(short(o.path))}</span><span class="dd"><span class="plus">+${f.additions}</span>${f.deletions ? `<span class="minus">−${f.deletions}</span>` : ""}</span><span class="dot ${w === 0 ? "dot-high" : w === 1 ? "dot-medium" : ""}"></span></a></li>`;
    }).join("");

    const back = DATA.triage ? `<a class="go" href="#/">← Queue</a>` : "";
    return `
<header class="topbar">${back}<button class="menu" aria-label="Contents">☰</button>
  <span class="t-title">${esc(pr.title)}<span class="t-num">#${esc(pr.number)}</span></span>
  ${a ? att(a.level) : ""}<span class="vsep hide-sm"></span>
  <span class="num hide-sm"><span class="plus">+${pr.additions}</span> <span class="minus">−${pr.deletions}</span></span>
  <span class="pill hide-sm">${plural(pr.filesChanged, "file")}</span>
  <span class="meta hide-sm num">${fmt(readLines)} to read${noiseLines ? ` · ${fmt(noiseLines)} noise` : ""}</span>
  <span class="grow"></span>${r.read ? `<span class="pill hide-sm">${esc(r.repo)}</span>` : ""}${pr.url ? `<a class="meta mono hide-sm" href="${esc(pr.url)}">GitHub ↗</a>` : ""}
</header>
<div class="overlay"></div>
<div class="shell">
  <nav class="side" aria-label="Contents">
    <div class="side-sec"><span class="side-label">Walkthrough</span><ul class="outline">${outline}</ul></div>
    <div class="side-sec"><span class="side-label">Files changed (${r.files.length})</span><ul class="flist">${flist}</ul></div>
  </nav>
  <main class="main">
    ${tldr}${overview}${changeMap}${shape}${look}${evidence}
    <section class="sec" style="margin-top:36px"><div class="sec-h">Walkthrough <span class="count">${esc(r.chapters?.length ? "grouped by the judge" : r.orderRule)}</span></div></section>
    ${walkthrough}${noiseBlock}
    <div class="footer"><span>This tour points attention. It gives no merge verdict and no security verdict.</span><span>Collapsed means low reading value, not verified.</span><span>Blue = written by the model.</span></div>
  </main>
</div>`;
  }

  function diffTable(f, i, items, foldAt = Infinity) {
    if (f.binary) return `<div class="empty" style="padding:10px 12px">Binary file.</div>`;
    if (!f.hunks.length) return `<div class="empty" style="padding:10px 12px">${f.status === "renamed" ? "Renamed without content changes." : "No content changes."}</div>`;
    const lang = langOf(f.path);
    const here = items.filter((x) => x.file === f.path && x.line != null);
    // File-level findings only; ASK WHY already shows in the TL;DR, the intent map and Where to look.
    const unanchored = items.filter((x) => x.file === f.path && x.line == null && x.severity !== "low" && x.source !== "map");
    const annBox = (h) => `<div class="ann-box">${sev(h.severity)}${src(h.source)}<div class="t">${inline(h.text)}${h.why ? `<div>${inline(h.why)}</div>` : ""}</div></div>`;
    const rows = (ls) => ls.map((l) => {
      const hits = here.filter((x) => (x.side === "old" ? l.t !== "add" && l.o === x.line : l.t !== "del" && l.n === x.line));
      const s = hits.length ? hits.map((h) => h.severity).sort((x, y) => SEV[x] - SEV[y])[0] : null;
      const id = l.n != null && l.t !== "del" ? `f${i}-n${l.n}` : `f${i}-o${l.o}`;
      return `<tr class="${l.t}${s ? " flag " + s : ""}" id="${id}"><td class="ln">${l.o ?? ""}</td><td class="ln">${l.n ?? ""}</td><td class="code">${highlight(l.s, lang) || " "}</td></tr>`
        + hits.map((h) => `<tr class="ann"><td colspan="3">${annBox(h)}</td></tr>`).join("");
    }).join("");
    const total = f.hunks.reduce((s, h) => s + h.lines.length, 0);
    const table = `<table class="diff">${unanchored.length ? `<tr class="ann"><td colspan="3">${unanchored.map(annBox).join("")}</td></tr>` : ""}${f.hunks.map((h) => `<tr class="hunk"><td colspan="3">${esc(h.header)}</td></tr>${rows(h.lines)}`).join("")}</table>`;
    return total > foldAt && !here.length ? `<details class="more"><summary><span class="caret">▸</span> Show ${fmt(total)} diff lines</summary>${table}</details>` : table;
  }

  // ---------- behaviour: scroll-spy, mobile menu ----------
  let spy = null;
  function wire() {
    window.removeEventListener("scroll", spy);
    const side = app.querySelector(".side"), overlay = app.querySelector(".overlay"), menu = app.querySelector(".menu");
    if (menu) {
      const close = () => { side.classList.remove("is-open"); overlay.classList.remove("is-open"); };
      menu.onclick = () => { side.classList.toggle("is-open"); overlay.classList.toggle("is-open"); };
      overlay.onclick = close;
      side.querySelectorAll("a").forEach((x) => x.addEventListener("click", () => { if (innerWidth <= 900) close(); }));
    }
    // The repo filter hides the other repos' rows and stays set until the page reloads.
    const rf = app.querySelector("#repo-filter");
    if (rf) rf.onchange = () => {
      repoFilter = rf.value;
      for (const row of app.querySelectorAll("tr[data-repo]")) row.hidden = !!repoFilter && row.dataset.repo !== repoFilter;
    };
    // A queue row opens its tour; links inside the row keep their own target.
    for (const row of app.querySelectorAll("tr.qrow")) {
      row.addEventListener("click", (e) => { if (!e.target.closest("a") && !getSelection().toString()) location.hash = row.dataset.href.slice(1); });
      row.addEventListener("keydown", (e) => { if (e.key === "Enter") location.hash = row.dataset.href.slice(1); });
    }
    // Change-map nodes open their file.
    for (const box of app.querySelectorAll(".cmap[data-links]")) {
      const map = JSON.parse(box.dataset.links);
      for (const t of box.querySelectorAll("text")) {
        const target = map[t.textContent.trim()];
        if (!target) continue;
        const g = t.closest("g") ?? t;
        g.style.cursor = "pointer";
        g.addEventListener("click", () => { location.hash = target.slice(1); });
      }
    }
    const links = [...app.querySelectorAll(".outline a[data-target]")];
    if (!links.length) return;
    const targets = links.map((l) => document.getElementById(l.dataset.target));
    let ticking = false;
    spy = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        let active = 0;
        targets.forEach((t, k) => { if (t && t.getBoundingClientRect().top <= 90) active = k; });
        links.forEach((l, k) => l.classList.toggle("is-active", k === active));
        const el = links[active];
        const sr = side.getBoundingClientRect(), er = el.getBoundingClientRect();
        if (er.top < sr.top + 40 || er.bottom > sr.bottom - 40) side.scrollTop += er.top - sr.top - sr.height / 3;
      });
    };
    window.addEventListener("scroll", spy, { passive: true });
    spy();
  }

  route();
})();
