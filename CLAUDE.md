# Tailor-Made

A challenge generator for off-rack dresses in *Dressmaker* (Cozy Lives / Free Lives). Story clients
hand the player a card of requirements. Off-rack dresses have none. Tailor-Made supplies a
generated client, a short brief, and a list of rules in the same shape as the game's own cards.
A challenge can be shared as a link that rebuilds the exact same challenge. There is also one
daily challenge, the same for everyone.

It is a public tool, for the Dressmaker community first. There is no backend and no storage in v1.

**Status: M1 in progress.** Scaffold, gate and CI are in. Generator core is next. See
`docs/superpowers/specs/2026-10-16-tailor-made-design.md` for the design this is built to. It is
the source of truth for scope, rules, the generator, the link format and the milestones.

**Wireframes live in `docs/wireframes/`** (M0, in progress). Every Linear issue names its frames
in a `**Wireframe:**` line. `—` means none were drawn. Build to the hi-fi frames when they exist.

---

## Commands

pnpm only. `packageManager` is pinned, so use corepack rather than a global pnpm if they differ.

| Command | Does |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | `tsc -b` then `vite build`. Typecheck is part of the build |
| `pnpm preview` | Serve the production build |
| `pnpm typecheck` | Types only, no emit |
| `pnpm lint` | ESLint, including the layering and determinism rules |
| `pnpm lint:fix` | ESLint with `--fix` |
| `pnpm format` / `pnpm format:check` | Prettier write / verify |
| `pnpm test` | Vitest once |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:coverage` | Vitest with v8 coverage |
| `pnpm test:e2e` | Playwright on a production build, desktop and mobile |
| `pnpm test:e2e:ui` | Playwright in its interactive UI mode |

**The gate before any commit is `pnpm lint && pnpm typecheck && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e`.**
CI runs the same gate as the job `gate` on every PR and on main. Main requires it.

Prettier does not touch Markdown. `*.md` is in `.prettierignore`. Prose here is hand-authored.

### Keep the README current

`README.md` is the setup and orientation doc. **Update it in the same commit as the change that
dates it.** A README corrected later was wrong in between, and nothing fails when it rots.

Changes that stale it, none of which the build will catch:

- **Scripts added, renamed or removed** in `package.json`: the command table and the gate
- **Node or pnpm version moves**: the requirements and `packageManager`
- **A new top-level directory under `src/`**, or a layer's responsibility shifting: the structure
  block and the dependency direction under it
- **A file moving that the README names by path**, including the design spec
- **A known gap being closed**: delete the entry rather than leaving a fixed problem listed

Do not put counts of anything in it. A count is stale on the next commit. Point at the command
that prints the real number instead.

---

## Stack: decided, do not relitigate

| Concern | Choice |
|---|---|
| Build / UI / language | Vite, React, TypeScript `strict` |
| Styling / components | Tailwind 4, shadcn/ui |
| Routing | React Router, declarative mode |
| Tests | Vitest, React Testing Library, Playwright, axe |
| Hosting | Netlify, static |
| Package manager | pnpm |
| Backend and storage | None in v1 |

If you think one of these needs revisiting, say so once with your reasoning and move on. Do not
quietly introduce an alternative.

**Netlify.** Hosting is Netlify static, but the deploy waits for PER-172 (43, M6, after the
screens) to save Netlify build minutes. Do not add Netlify config before then.

### Versions as built

These are the facts as installed. Check `package.json` before quoting a version from memory.

| Thing | Installed | Note |
|---|---|---|
| Vite / React | 8 / 19 | |
| TypeScript | **6.0.x, held below latest** | `typescript-eslint` peers `<6.1.0`. Moving up would lose type-aware linting, which enforces hard rules 1 and 4. Revisit when the peer range widens |
| pnpm | 9.15.9 | Pinned in `packageManager`. The installed corepack (0.33) cannot run pnpm 12 |
| React Router | 8, declarative mode | Not framework mode. No loaders, no `route.ts` |
| Tailwind | 4, via `@tailwindcss/vite` | CSS-first. There is no `tailwind.config.js` and should not be |
| shadcn/ui | CLI 4, `base-nova` | Ships **Base UI** (`@base-ui/react`), not Radix |
| ESLint / Vitest | 10 / 5 | |

The shadcn CLI reads path aliases from `tsconfig.json` only, but the Vite template splits
tsconfigs. `@/` is therefore declared in **both** `tsconfig.json` and `tsconfig.app.json`. Keep
them in sync. Do not add `baseUrl` to either. `paths` resolves relative to the tsconfig's own
directory.

---

## Hard rules

1. **`src/domain` is pure.** No I/O, no `Math.random`, no `Date`. Randomness and time come in as
   inputs. Lint enforces it.
2. **Data and brief versions are frozen once published.** Any change, including a game update that
   adds content, goes in a new `vN.ts`. Never edit `v1.ts` after it ships (spec section 4).
3. **Share links rebuild forever.** A link names its data version. The PRNG (cyrb128 seeding sfc32,
   with 15 warm-up draws) never changes for a published version.
4. **Layering runs one way: `features → links → domain → game`.** `no-restricted-imports` in
   `eslint.config.js` enforces it. Do not lift a rule to get around it. Move the code.
5. **Desktop and mobile are equals.** Design, build and test both. Playwright runs both projects.

---

## Testing: a green suite proves less than it looks

A passing suite shows the code does what the test author expected. When the same person wrote
both, from the same mental model, the tests agree with the code rather than with reality.

**Verify every new guarantee by watching the suite go red.** Break the thing deliberately, run
`pnpm test`, confirm it fails for the right reason, then restore:

```bash
F=src/domain/example.ts
cp "$F" "$TMPDIR/probe.bak"     # NOT `git checkout --` to restore: see below

# match on the code, never a line number. Line numbers drift and the probe
# then silently applies nothing, which reads exactly like a passing test
sed -i '' 's/some code/changed code/' "$F"
git diff --stat                 # confirm it applied. For an untracked file, grep for the change
pnpm test                       # expect FAILURE. Green here means the test is fake

cp "$TMPDIR/probe.bak" "$F"
```

**Restore from a copy, never with `git checkout -- <file>`.** That reverts to `HEAD`, so if the
code you are probing is not committed yet, it deletes the feature along with the probe. The two
failure modes are both silent: a probe that applies nothing looks like a passing test, and a
restore that reverts too much looks like a clean tree.

When you change a test, re-run every probe for that guarantee, not just the one you are working on.

**Never write a test that cannot fail.** jsdom does not evaluate CSS media queries, so a
breakpoint assertion passes whatever the classes say. Check breakpoints in Playwright. Never
assert a constant against its own literal.

**Determinism snapshots protect old share links.** Fixed seeds produce snapshot-pinned
challenges (spec section 13). If a snapshot moves, the change broke old links. Do not update the
snapshot to make it pass. Put the change in a new version.

---

## Comments: fewer, and only where the code cannot speak

The default is no comment, in every file: source, tests, scripts and config. Code, types and test
names carry most of the meaning, and a comment that restates them is a second thing that has to
stay true.

**When one is truly needed, it is one to three lines at most**, in plain English. If it needs
more, the reasoning belongs in `docs/` and the comment is a one-line pointer to it.

Write one only for:

- **A constraint the code cannot show.** Something nobody infers from the lines around it.
- **A deliberate choice that looks like a mistake.** Without the note, the next reader
  "simplifies" it.
- **A guarantee a caller must not break.**

Never for:

- **Ticket numbers, commit numbers or milestones.** Linear and `git log` hold these.
- **What a ticket used to say, or who decided what.** That is a commit message.
- **Future work.** It is wrong the day the work lands, and nothing fails when it rots.
- **Restating the signature.**
- **Rationale longer than three lines.** That goes in `docs/` or in this file.

Style:

- No em dashes. A full stop or a comma does the same work.
- No semicolons joining clauses. Split the sentence.
- No ALL-CAPS emphasis.
- No stacked parentheticals, and no sentence with three subordinate clauses.
- A file header is one or two lines on what the file is for.

The check before keeping one: imagine it deleted. If nothing is lost, delete it.

---

## Game data

Sources: dressmakerwiki.site (fan wiki, build 410), cross-checked with cozygameguides.com.
`docs/notes/build-443-check.md` records what build 443 changed. It added no new fabric type,
accessory type, tag or colour. Read it before freezing v1.

- The data works at fabric-type level, not individual fabrics.
- Credit both sources in the data file header and on the About page.
- Unofficial and unaffiliated. No game art, client names or card text.

---

## Pull requests: one per issue, Theo merges

- **One branch and one PR per Linear issue.** Use the branch name Linear supplies on the issue
  (for example `theosaurus13/per-139-10-claudemd-and-readme`) so it links automatically.
- **Dependent issues are stacked.** Each PR is based on the previous issue's branch. Say so in
  Notes.
- **Never push to `main`, and never merge.** Theo verifies the change by hand and merges.
  Opening the PR is where your work stops.
- **The gate runs before the PR opens**, not after.
- Link the Linear issue.
- **No tool-attribution lines** in commit messages or PR bodies. No `Co-Authored-By`, no
  "Generated with Claude Code".

### Size

- **Aim for under 500 changed lines. Over 1000 is a hard limit.** Count additions plus deletions
  from `git diff --stat main...HEAD`.
- Lockfiles, generated data and binary assets do not count, but say in the PR that they are
  there.
- Going over 1000 needs a real reason, stated at the top of the PR.
- **Split the issue rather than the rule.** If it looks like it will pass 500 lines, propose
  smaller issues before building. Each piece should work and pass the gate on its own.

### Writing the PR body

This repo is a portfolio piece. Non-engineers may read the PRs. **Write for someone who knows what
the app does but has not read the code.**

- Plain English, short sentences. No filler ("this PR aims to", "robust", "seamless").
- Name things by what the user sees, not what the code calls them.
- Technical detail goes in the notes, not the summary.
- Keep each section short.

Use these four sections, in this order. `.github/pull_request_template.md` fills them in on
GitHub. `gh pr create --body` does not use it, so paste the same shape:

```markdown
## Summary
What changed and why, in two to four sentences. Link the Linear issue.

## How to check it
- [ ] Short, exact steps a reviewer can follow by hand, each with what they should see.
- [ ] Call out anything a test cannot cover, like layout at phone width or anything visual.

## Impact on the app
What a user of the app will notice. Say plainly if nothing visible changes.

## Notes
What is deliberately out of scope, so a missing thing does not read as an oversight.
Follow-up issues, known gaps, the stack position and any size-limit justification go here too.
```

---

## Linear

This is a **personal** project. Issues live in the **Personal** workspace
(`linear.app/theo-harris-dev`), team `PER`, project **Tailor-Made**:
https://linear.app/theo-harris-dev/project/tailor-made-c01ffb737995

Issues are titled `NN · Title`, where `NN` is the build order. Milestones M0 to M6 run in
dependency order, with `blockedBy` relations set. Issues with a showable artefact carry the
`case-study` label.

**Theo's employer Linear may also be connected in other contexts. Never file issues for this
project there.** Confirm the workspace is `Personal` before filing anything.
