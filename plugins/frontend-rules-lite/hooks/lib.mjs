// Shared helpers for the kit's hooks. Node 18+, no dependencies, works on macOS/Linux/Windows.
import fs from "node:fs";
import path from "node:path";

export async function readInput() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  try { return JSON.parse(raw); } catch { return null; }
}

export function projectDir(input) {
  return process.env.CLAUDE_PROJECT_DIR || input?.cwd || process.cwd();
}

export function relPath(root, file) {
  if (!file) return "";
  const abs = path.isAbsolute(file) ? file : path.join(root, file);
  return path.relative(root, abs).split(path.sep).join("/");
}

/** Block the tool call (PreToolUse) or send feedback to Claude (PostToolUse). */
export function block(message) {
  process.stderr.write(message.endsWith("\n") ? message : message + "\n");
  process.exit(2);
}

export function readJSONC(file) {
  try { return parseJSONC(fs.readFileSync(file, "utf8")); } catch { return null; }
}

/** JSON with comments + trailing commas (tsconfig style), string-aware. */
export function parseJSONC(text) {
  let out = "", i = 0, inStr = false;
  while (i < text.length) {
    const c = text[i], n = text[i + 1];
    if (inStr) { out += c; if (c === "\\") { out += n; i += 2; continue; } if (c === '"') inStr = false; i++; continue; }
    if (c === '"') { inStr = true; out += c; i++; continue; }
    if (c === "/" && n === "/") { while (i < text.length && text[i] !== "\n") i++; continue; }
    if (c === "/" && n === "*") { i += 2; while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++; i += 2; continue; }
    out += c; i++;
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}
