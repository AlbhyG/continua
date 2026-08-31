---
name: file-continua-issue
description: Draft and file a GitHub issue on AlbhyG/continua from a feature request or bug Albhy describes, matching this repo's established issue house style. Use proactively whenever Albhy describes a bug, a missing feature, a desired change, or is thinking out loud about something he wants built — even if he never says "create an issue" or "file a bug". Albhy doesn't write code himself (his son Jason implements from GitHub issues); turning discussion into a filed issue, not writing code, is the default way to move from talk to action in this repo. Trigger on things like "I noticed there's no logout", "can you make an issue for that", "I want to add X", "let's get this to Jason", a pasted screenshot/PDF with a stream-of-consciousness list of asks, or any description of desired behavior that doesn't exist yet.
---

# File a Continua GitHub issue

Albhy plans this project by talking it through with Claude; he doesn't write code himself. His son Jason implements by pulling issues straight from `AlbhyG/continua` on GitHub — there are no PRs in this workflow, so an issue is the actual handoff artifact, not a formality. When Albhy describes something he wants changed, default to filing an issue rather than writing code yourself, unless he explicitly asks you to implement it directly.

## 1. Ground it in the real code first

Before drafting anything, go look at the actual code the issue will touch — grep for the relevant component/route/behavior, read the files involved. Issues in this repo cite exact file paths as markdown links (e.g. `File: [src/components/layout/Header.tsx](src/components/layout/Header.tsx)`), and that only works — and is only trustworthy for Jason — if you've actually confirmed those are the right files and that the current code matches what you're describing. Don't guess a path because it sounds plausible.

If Albhy's ask splits into genuinely unrelated pieces (e.g. one part is a content/legal decision, another is an unrelated layout bug elsewhere), **file them as separate issues**, not one bundled one. That's the established precedent in this repo — don't make Jason untangle a multi-topic issue.

## 2. Pick the right template weight

**Pattern A — rich** (default for anything with multiple sub-changes, or that's grounded in specific code you explored):

```
**From:** Albhy — for Jason, to hand to Claude (Claude Code or chat) working in this repo

## Context
<why this is being asked — background, what triggered it>

## 1. <first sub-change>
File: [path/to/file.tsx](path/to/file.tsx)
- <concrete bullet-point change>
- <concrete bullet-point change>

## 2. <second sub-change>
File: [path/to/other-file.ts](path/to/other-file.ts)
- ...

## Not in scope for this pass
- <anything explicitly deferred or excluded, and why>
```

**Pattern B — simple** (for a single, self-contained bug/request that doesn't need code exploration to describe):

```
## Problem
<what's wrong or missing>

## Expected behavior
<what should happen instead>

## Reported by
Albhy
```

Use judgment, not a hard rule: a one-line "there's no logout button" bug is Pattern B; anything where you had to go read multiple files to describe the fix accurately is Pattern A.

## 3. Label it

Use exactly one of the three labels already in active use in this repo:
- `enhancement` — new feature or requested change
- `bug` — something broken
- `discussion` — open-ended or decision-needed, not yet a concrete spec

## 4. Handle open judgment calls the way past sessions have

If drafting the issue raises a small open question (e.g. "should we also drop this now-unused DB column, or leave it for later?"), don't necessarily stop and ask — if Albhy has already said something like "your judgment" or "just file it," make the call yourself, **note the call you made directly in the issue body** so Jason and Albhy both see the reasoning, and tell Albhy afterward what you decided. Reserve blocking, upfront questions for calls that are either irreversible, expensive, or genuinely need Albhy's judgment (not Claude's) to resolve — e.g. legal/content decisions, or anything price- or scope-changing.

Otherwise — this is the normal case — **show Albhy the drafted title + body and get a go-ahead before filing.** He's a non-coder handing this to his son; a quick "does this look right?" costs little and catches misreadings of what he meant.

## 5. File it

Write the body to a temp file first (these bodies are multi-line markdown — piping through `--body` directly risks shell-escaping problems):

```
~/bin/gh issue create --repo AlbhyG/continua \
  --title "<title>" \
  --body-file /tmp/continua-issue-body.md \
  --label <enhancement|bug|discussion>
```

`gh` lives at `~/bin/gh` and is **not** on PATH in this shell — always use the full path, never bare `gh`.

## 6. Report back

Give Albhy the issue number(s) and URL(s) (e.g. `#18 — https://github.com/AlbhyG/continua/issues/18`). If you made any judgment calls per step 4, restate them briefly here too, not just in the issue body.

If it comes up: GitHub issues aren't part of git history, so no `git push` or deploy is needed for them to go live — they're visible on GitHub the instant `gh issue create` succeeds. (Albhy has asked about this before — worth a one-line reminder rather than assuming he remembers.)
