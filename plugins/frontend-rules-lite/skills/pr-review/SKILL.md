---
name: pr-review
description: Review the current branch's diff like a staff frontend engineer and report findings by severity. Use when the user asks for a review, "check my changes", or before opening a PR.
---

# PR review

## Get the diff
`git diff <base>...HEAD`, where `<base>` is the base branch in CLAUDE.md (or the one the user names). Also read the full content of each changed file, not just the hunks. Bugs usually hide in the context around a change.

## Review in this order
1. **Correctness:** logic errors, wrong conditions, unhandled null/undefined, race conditions in effects, stale closures, missing `key`s, effects missing dependencies or running too often.
2. **Data and state:** server state copied into client state, missing loading/error states, cache keys that don't include every input, optimistic updates without rollback.
3. **Security:** `dangerouslySetInnerHTML`, user input in URLs or redirects, secrets or tokens in client code, `NEXT_PUBLIC_` variables that shouldn't be public.
4. **Accessibility:** clickable `div`s, missing labels, broken focus order, colour-only meaning, images without alt text.
5. **Performance:** `"use client"` placed too high in the tree, large imports that could be dynamic, images not going through `next/image`, re-renders caused by inline objects passed to memoised children.
6. **Conventions:** anything that breaks a rule in CLAUDE.md.
7. **Tests:** is every new behaviour tested? Do the tests check behaviour or implementation details?

## Report format
```
### Must fix
- path/to/file.tsx:42 — <problem>. <why it matters>. Fix: <concrete suggestion>

### Should fix
- ...

### Nits
- ...

### What's good
- <only if there's something specific worth keeping; skip this section otherwise>

Verdict: Ready to merge / Needs changes
```
Every finding needs a file:line and a concrete fix. If you're not sure something is a bug, say so; don't inflate the severity. Don't edit any files unless the user asks you to fix the findings.
