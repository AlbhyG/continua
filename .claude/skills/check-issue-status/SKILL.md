---
name: check-issue-status
description: Check the real status of GitHub issues on AlbhyG/continua — whether work is actually done, not just what the open/closed label says. Use whenever Albhy asks about issue status, what's been done, what Jason has finished, whether something got fixed, or wants a progress update on features/bugs he filed — e.g. "what's the status of my issues", "did Jason get to the logout thing", "is #14 done yet", "what's still outstanding", "where do things stand". Jason (Albhy's son, who implements from these issues) commits straight to main without closing issues or referencing issue numbers in commit messages, so the GitHub label alone is known to be unreliable here — always verify against the actual code before reporting status.
---

# Check Continua issue status

Albhy plans by chat and files GitHub issues for his son Jason to implement (see project memory for the full workflow). Jason works directly against the repo and doesn't close issues or reference issue numbers in commits when he finishes something — so an issue sitting "open" on GitHub is not reliable evidence that nothing happened. The whole point of this skill is to look past the label and check the code.

## Steps

1. **Pull the latest code first.** Jason may have committed since the last session.
   ```
   git pull
   ```

2. **List all issues, every state.**
   ```
   ~/bin/gh issue list --repo AlbhyG/continua --state all --limit 200
   ```
   `gh` is installed at `~/bin/gh` but is not on the shell's PATH in this environment — always use the full path, never bare `gh`.

3. **For each CLOSED issue**, take the label at face value — closed means done, no need to re-verify unless Albhy specifically asks you to double check one.

4. **For each OPEN issue, actually investigate it** — don't just repeat back "open." Pull the full body:
   ```
   ~/bin/gh issue view <N> --repo AlbhyG/continua --json title,body,labels
   ```
   Issue bodies in this repo consistently name the exact files involved (e.g. `File: [src/components/layout/Header.tsx](src/components/layout/Header.tsx)`). Read those files as they exist now and judge, from the actual code, whether the described change has landed:
   - Grep for the specific behavior, strings, or component names the issue describes.
   - Check whether files the issue says to delete are still present, or whether files it says to add/modify show the described change.
   - If it's ambiguous from a quick read, check `git log --oneline -20 -- <file>` for that file to see if it's been touched recently and skim the diff.

   Judge each open issue into one of two buckets:
   - **Still needed** — the code clearly doesn't reflect the issue yet.
   - **Looks done but still open** — the code now matches what the issue asked for. This is the discrepancy this skill exists to catch.

5. **Report back grouped by these three buckets**, not by raw GitHub state:
   - ✅ **Closed (done)** — closed issues, one line each (title + link).
   - 🔧 **Open — still needed** — genuinely outstanding work.
   - ⚠️ **Open — looks already done** — flag explicitly; this is a discrepancy Albhy should know about. Say specifically what you checked (which files, what you found) so he can trust the judgment, and offer to close it if he confirms.

   Keep each entry short: issue number, title, one-line reasoning. Don't dump full issue bodies back at him.

6. **If Albhy confirms** a "looks already done" issue really is finished, close it:
   ```
   ~/bin/gh issue close <N> --repo AlbhyG/continua --comment "<short note on what landed and, if you found it, roughly when/how>"
   ```
   Don't close anything without that confirmation — your code-reading judgment is a strong signal, not certainty.

## Notes

- If Albhy asks about one specific issue rather than a full sweep, just do steps 2–5 for that one issue instead of listing everything.
- If the same underlying change satisfies multiple open issues at once (this has happened — issues can overlap), say so rather than reporting them as unrelated.
