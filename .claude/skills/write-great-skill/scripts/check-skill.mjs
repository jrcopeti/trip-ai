#!/usr/bin/env node
// check-skill.mjs — mechanical checks for one skill folder. Read-only.
// Usage: node scripts/check-skill.mjs <skill-folder>
// Exit 0: no FAIL (warnings may remain). Exit 1: at least one FAIL. Exit 2: bad usage.
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const LIMITS = {
  nameMax: 64,
  descSpec: 1024, // Agent Skills spec maximum
  descClaudeCode: 1536, // Claude Code cuts the skill listing here
  firstSentence: 57, // Hermes shows this much of a description
  bodyWarn: 150,
  bodyFail: 500,
};

const FILLER = [
  "make sure", "ensure that", "best practice", "as needed", "as appropriate", "properly",
  "clean code", "meaningful name", "be careful", "high-quality", "high quality", "robust",
  "comprehensive", "this skill helps", "it is important", "don't forget", "feel free",
];

// Minimal YAML for frontmatter: `key: value`, quoted values, block scalars (| >), plain continuation lines.
export function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0].trim() !== "---") return null;
  const stop = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (stop < 0) return null;
  const fm = {};
  const raw = lines.slice(1, stop);
  for (let i = 0; i < raw.length; i++) {
    const m = raw[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rest] = m;
    let value = rest;
    if (/^[|>][-+]?\s*$/.test(rest)) {
      const block = [];
      while (i + 1 < raw.length && (/^\s+\S/.test(raw[i + 1]) || raw[i + 1].trim() === "")) block.push(raw[++i].trim());
      value = rest.startsWith("|") ? block.join("\n").trim() : block.filter(Boolean).join(" ");
    } else if (rest.startsWith('"')) {
      let s = rest;
      while (!/[^\\]"\s*$/.test(s) && i + 1 < raw.length) s += " " + raw[++i].trim();
      try { value = JSON.parse(s.trim()); } catch { value = s.trim().slice(1, -1); }
    } else if (rest.startsWith("'")) {
      let s = rest;
      while (!/'\s*$/.test(s.slice(1)) && i + 1 < raw.length) s += " " + raw[++i].trim();
      value = s.trim().slice(1, -1).replace(/''/g, "'");
    } else {
      while (i + 1 < raw.length && /^\s+\S/.test(raw[i + 1])) value += " " + raw[++i].trim();
      value = value.trim();
    }
    fm[key] = value;
  }
  return { fm, bodyStart: stop + 1 };
}

export function firstSentence(desc) {
  const m = desc.match(/^.*?[.!?](?=\s|$)/s);
  return (m ? m[0] : desc).trim();
}

const stripFences = (md) => md.replace(/^(```|~~~)[\s\S]*?^\1/gm, "");

function mdFiles(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...mdFiles(p));
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

export function checkSkill(dirArg) {
  const dir = resolve(dirArg);
  const fails = [];
  const warns = [];
  const facts = {};
  const skillMd = join(dir, "SKILL.md");
  if (!existsSync(skillMd)) return { fails: [`no SKILL.md in ${dir}`], warns, facts };
  const text = readFileSync(skillMd, "utf8");
  const parsed = parseFrontmatter(text);
  if (!parsed) return { fails: ["SKILL.md does not start with a --- frontmatter block"], warns, facts };
  const { fm, bodyStart } = parsed;

  // name
  const name = fm.name;
  if (!name) fails.push("frontmatter has no name");
  else {
    if (name.length > LIMITS.nameMax || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name))
      fails.push(`name "${name}": use lowercase letters, digits and single hyphens, at most ${LIMITS.nameMax} characters`);
    if (name !== basename(dir)) fails.push(`name "${name}" differs from the folder name "${basename(dir)}"`);
  }

  // description
  const desc = fm.description;
  if (!desc) fails.push("frontmatter has no description: the agent cannot pick this skill");
  else {
    const first = firstSentence(desc);
    Object.assign(facts, { descriptionChars: desc.length, firstSentence: first, firstSentenceChars: first.length });
    if (desc.length > LIMITS.descClaudeCode)
      fails.push(`description is ${desc.length} characters; Claude Code cuts it at ${LIMITS.descClaudeCode}`);
    else if (desc.length > LIMITS.descSpec)
      warns.push(`description is ${desc.length} characters; the Agent Skills spec allows ${LIMITS.descSpec}, so other tools may reject or cut it`);
    if (first.length > LIMITS.firstSentence)
      warns.push(`first sentence is ${first.length} characters; Hermes shows ${LIMITS.firstSentence}: put the task first, shorter`);
    if (!/use (it )?(this )?when/i.test(desc)) warns.push('description has no "Use when …": list the words a user would say');
    if (/^(this|a|the) skill\b/i.test(desc)) warns.push('description starts with "This skill …": start with the task (trigger words first)');
    if (desc.length < 80) warns.push(`description is only ${desc.length} characters: too vague to be picked`);
  }

  // body
  const bodyLines = text.split(/\r?\n/).slice(bodyStart);
  const body = bodyLines.join("\n");
  facts.bodyLines = bodyLines.length;
  if (bodyLines.length > LIMITS.bodyFail) fails.push(`SKILL.md body is ${bodyLines.length} lines; move material to references/ (limit ${LIMITS.bodyFail})`);
  else if (bodyLines.length > LIMITS.bodyWarn) warns.push(`SKILL.md body is ${bodyLines.length} lines; aim under 100, move one-step material to references/`);
  if (!/^#+\s*gotchas/im.test(body)) warns.push("no Gotchas section: add one, and a line each time the agent gets something wrong");
  if (!/done when/i.test(body)) warns.push('no "Done when" check in any step');

  // placeholders, filler (outside code and quotes)
  bodyLines.forEach((line, i) => {
    const n = bodyStart + i + 1;
    const prose = line.replace(/`[^`]*`/g, "").replace(/"[^"]*"/g, "").replace(/“[^”]*”/g, "");
    if (/\b(TODO|TBD|FIXME)\b/.test(prose)) fails.push(`SKILL.md:${n}: placeholder left: ${line.trim()}`);
    for (const f of FILLER) if (prose.toLowerCase().includes(f)) warns.push(`SKILL.md:${n}: filler "${f}": name the command, path or number instead, or delete the line`);
  });

  // links to files that do not exist (every .md in the skill, relative to that file)
  for (const file of mdFiles(dir)) {
    const md = stripFences(readFileSync(file, "utf8"));
    const rel = file.slice(dir.length + 1);
    const targets = new Set();
    for (const m of md.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) targets.add(m[1]);
    for (const m of md.matchAll(/`((?:scripts|references|examples|assets|templates)\/[^`\s]+)`/g)) targets.add(m[1]);
    for (let t of targets) {
      if (/^([a-z]+:|#)/i.test(t) || /[<>*{}$]/.test(t) || /:\d+$/.test(t)) continue;
      // only paths that belong to the skill: its folders, ./ ../, or another markdown file
      if (!/^(\.{1,2}\/|(scripts|references|examples|assets|templates)\/)/.test(t) && !/\.md(#.*)?$/.test(t)) continue;
      t = t.split("#")[0];
      const fromFile = resolve(dirname(file), t);
      const fromRoot = resolve(dir, t);
      if (!existsSync(fromFile) && !existsSync(fromRoot)) fails.push(`${rel}: links to ${t}, which does not exist`);
    }
  }

  // scripts SKILL.md runs directly (`scripts/x.sh …`, no interpreter in front) need the executable bit
  const sdir = join(dir, "scripts");
  if (existsSync(sdir)) {
    for (const e of readdirSync(sdir, { withFileTypes: true })) {
      if (!e.isFile()) continue;
      const p = join(sdir, e.name);
      const calledDirectly = body.includes("`scripts/" + e.name) || body.includes("`./scripts/" + e.name);
      if (calledDirectly && !(statSync(p).mode & 0o111)) warns.push(`scripts/${e.name} is run directly but is not executable: chmod +x`);
    }
  }
  return { fails, warns, facts };
}

function main() {
  const dir = process.argv[2];
  if (!dir || dir === "-h" || dir === "--help") {
    console.error("usage: node check-skill.mjs <skill-folder>");
    process.exit(2);
  }
  const { fails, warns, facts } = checkSkill(dir);
  if (facts.descriptionChars !== undefined)
    console.log(`description: ${facts.descriptionChars} chars; first sentence: ${facts.firstSentenceChars} chars ("${facts.firstSentence}")`);
  if (facts.bodyLines !== undefined) console.log(`SKILL.md body: ${facts.bodyLines} lines`);
  for (const f of fails) console.log(`FAIL ${f}`);
  for (const w of warns) console.log(`WARN ${w}`);
  console.log(fails.length ? `${fails.length} FAIL, ${warns.length} WARN` : `OK (${warns.length} WARN)`);
  process.exit(fails.length ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
