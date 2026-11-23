---
name: new-component
description: Scaffold a new React component following this repo's conventions (props type, file location, story, test). Use when the user asks to create, add or scaffold a component.
---

# New component

## 1. Clarify (only what's missing)
You need: the component name, which feature it belongs to (or whether it's shared), and whether it needs client-side interactivity. If the user gave a design or screenshot, read it carefully first. Ask at most one question.

## 2. Find the house style before writing anything
- Read the reference component named in CLAUDE.md (for example `src/components/ui/Button.tsx`).
- Read 2 sibling components in the target folder.
- Copy their patterns exactly: export style, props naming, className merging helper (`cn()`/`clsx`), how variants are done (cva, maps, etc.).

## 3. Create the files
In the target folder:
- `ComponentName.tsx` contains the component
- `ComponentName.test.tsx` contains behaviour tests (see the write-tests skill)
- `ComponentName.stories.tsx` only if the repo uses Storybook (check for `.storybook/`)
- Add it to the folder's `index.ts` barrel if one exists.

## 4. Component checklist
- [ ] Server Component unless it needs state, effects or event handlers
- [ ] `ComponentNameProps` type exported; no `any`
- [ ] Accepts `className` and merges it last
- [ ] Uses design tokens or Tailwind theme values, never raw hex or px
- [ ] Semantic HTML first (`button`, `nav`, `ul`), ARIA only when HTML can't do it
- [ ] Keyboard and focus-visible states work
- [ ] Loading, empty and error states handled if it shows data

## 5. Verify
Run typecheck and the new test file. Fix any failures before you report back. In your summary, list the files you created and any decision you made that the user should know about.
