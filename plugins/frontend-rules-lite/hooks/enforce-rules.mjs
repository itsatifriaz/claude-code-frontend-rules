#!/usr/bin/env node
// Claude Code Frontend Rules (lite), by Atif Riaz. Full Team Kit: https://atifriazse.gumroad.com/l/claude-code-team-kit
// PreToolUse: check the code Claude is ABOUT to write against .claude/rules.json, and block the edit
// if it breaks a team rule. Claude gets the reason and rewrites the code, so the bad line never lands.
//
// Only CHANGED lines are checked:
//   Edit/MultiEdit : lines in new_string that weren't already in old_string
//   Write          : lines that aren't already in the file on disk
// So editing a legacy file never makes Claude fix the old code around it.
import fs from "node:fs";
import path from "node:path";
import { readInput, projectDir, relPath, block, readJSONC } from "./lib.mjs";

const input = await readInput();
if (!input) process.exit(0);
const t = input.tool_input || {};
const file = t.file_path;
if (!file) process.exit(0);

const root = projectDir(input);
// Your repo's .claude/rules.json wins; otherwise the plugin's built-in starter rules apply.
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const config = readJSONC(path.join(root, ".claude", "rules.json")) || readJSONC(path.join(pluginRoot, "rules.json"));
if (!config?.rules?.length) process.exit(0);
const rel = relPath(root, file);
if (config.ignore && new RegExp(config.ignore).test(rel)) process.exit(0);

const abs = path.isAbsolute(file) ? file : path.join(root, file);
const current = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : "";

// ---- Work out which lines are new, with best-effort line numbers ----
// JSX text can span lines (<p>\n  Cancel any time: any plan\n</p>). Mask it across the whole
// chunk, keeping line structure, so code rules don't fire on UI copy.
function maskJsxText(text) {
  return text.replace(/(?<![=\-])>([^<>{}=;]*)</g, (m, inner) => ">" + inner.replace(/[^\n]/g, " ") + "<");
}
function added(oldText, newText, baseLine) {
  const pool = new Map();
  for (const l of oldText.split("\n")) pool.set(l, (pool.get(l) || 0) + 1);
  const masked = maskJsxText(newText).split("\n");
  const out = [];
  newText.split("\n").forEach((l, i) => {
    const n = pool.get(l) || 0;
    if (n > 0) { pool.set(l, n - 1); return; }
    out.push({ text: l, code: masked[i] ?? l, line: baseLine ? baseLine + i : null });
  });
  return out;
}
const lineOf = (needle) => { const i = needle ? current.indexOf(needle) : -1; return i < 0 ? null : current.slice(0, i).split("\n").length; };

let changes = [];
if (typeof t.content === "string") changes = added(current, t.content, 1);
else if (typeof t.new_string === "string") changes = added(t.old_string || "", t.new_string, lineOf(t.old_string));
else if (Array.isArray(t.edits)) for (const e of t.edits) changes.push(...added(e.old_string || "", e.new_string || "", lineOf(e.old_string)));
if (!changes.length) process.exit(0);

// ---- Strip strings and comments so `"any[]"` or `// accepts any value` don't trigger code rules ----
function codeOnly(line) {
  if (/^\s*(\*|\/\*\*?)/.test(line)) return ""; // JSDoc / block-comment lines
  return line
    // template literals: keep only the ${...} expressions
    .replace(/`(?:\\.|[^`])*`/g, (t) => (t.match(/\$\{[^}]*\}/g) || []).join(" "))
    .replace(/(["'])(?:\\.|(?!\1).)*\1/g, '""')
    .replace(/\/\/.*$/, "")
    .replace(/\/\*.*?\*\//g, "")
    // JSX text between tags: <span>Size: any</span>
    .replace(/>([^<>{}]*)</g, "><")
    .replace(/^([^<>{}=();]*)<\//, "</");
}

const violations = [];
for (const rule of config.rules) {
  if (rule.files && !new RegExp(rule.files).test(rel)) continue;
  if (rule.exclude && new RegExp(rule.exclude).test(rel)) continue;
  const re = new RegExp(rule.pattern, rule.flags || "");
  for (const c of changes) {
    if (/rules-allow:/.test(c.text)) continue; // explicit, visible exception
    const subject = rule.scan === "all" ? c.text : codeOnly(c.code);
    if (re.test(subject)) violations.push(`  ${rel}${c.line ? ":" + c.line : ""}  [${rule.id}] ${rule.message}\n    > ${c.text.trim().slice(0, 140)}`);
  }
}

if (violations.length) {
  block(`This edit breaks team rules (.claude/rules.json), so it was not applied. Rewrite it:\n${[...new Set(violations)].join("\n")}\nIf a line is a genuine exception, add a comment "// rules-allow: <reason>" on that line and tell the user why.`);
}
process.exit(0);
