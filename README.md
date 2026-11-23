# Claude Code Frontend Rules (lite)

**Stop Claude Code from breaking your frontend conventions.** A free Claude Code plugin for React, Next.js and TypeScript projects.

CLAUDE.md is guidance, and in long sessions Claude forgets it. This plugin adds a hook that checks the code Claude is **about to write** and refuses the edit if it breaks a rule. Claude gets the reason and rewrites the code in the same turn, so the bad line never lands.

```
This edit breaks team rules (.claude/rules.json), so it was not applied. Rewrite it:
  src/components/PriceTag.tsx:1  [no-any] No `any`. Use a real type, or `unknown` and narrow it.
    > export function PriceTag({ data }: { data: any }) {
  src/components/PriceTag.tsx:2  [no-fetch-in-components] No raw fetch() in components.
    > const r = fetch("/api/price");
```

## Install

In Claude Code:

```
/plugin marketplace add itsatifriaz/claude-code-frontend-rules
/plugin install frontend-rules-lite@atifriaz-frontend
```

Requires Node 18+. Works on macOS, Linux and Windows.

## What's included

| | |
|---|---|
| **enforce-rules hook** | Checks only the lines Claude changes (legacy code around an edit is never flagged). Ignores strings, comments and JSX text. |
| **5 starter rules** | `no-any`, `no-ts-ignore`, `no-console-log`, `no-fetch-in-components`, `no-raw-img` |
| **/pr-review skill** | Staff-level review of your branch: correctness, data, security, accessibility, performance, conventions |
| **/new-component skill** | Scaffolds components that copy your repo's existing house style |

## Use your own rules

Create `.claude/rules.json` in your repo. When it exists, it replaces the built-in starter rules:

```json
{
  "rules": [
    {
      "id": "use-format-price",
      "pattern": "\\.toFixed\\(2\\)",
      "files": "(^|/)src/.*\\.(ts|tsx)$",
      "message": "Format prices with formatPrice() from src/lib/money.ts."
    }
  ]
}
```

A line with `// rules-allow: <reason>` is allowed, so exceptions stay visible in review.

## Want the full Team Kit?

The lite plugin is one piece of the **[Claude Code Team Kit](https://atifriazse.gumroad.com/l/claude-code-team-kit)**:

- **setup.mjs**: scans your repo and writes a CLAUDE.md for your real stack, in seconds (monorepo-aware)
- **Definition-of-done hook**: Claude can't finish while typecheck, lint or related tests fail
- **30-rule library** (Next.js, React, security, accessibility, Tailwind, i18n, testing, Vue), every rule tested
- **14 skills**: ticket→PR, tests, Storybook, Figma→code, Playwright browser checks, migrations, production debugging, SEO, a11y, performance, onboarding docs, and turning PR review history into rules
- Read-only reviewer and test-writer subagents with **enforced** limits, secrets protection, a GitHub Actions PR review workflow, team rollout tools and a **21-page playbook**

**[Get the Team Kit →](https://atifriazse.gumroad.com/l/claude-code-team-kit)**

---

MIT licence · by [Atif Riaz](https://x.com/iamatifriaz), Lead Frontend Engineer, 10+ years in software engineering
