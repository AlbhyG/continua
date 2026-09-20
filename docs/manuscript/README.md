# Private manuscript source

The full manuscript is unpublished source material stored in the **private**
Supabase Storage bucket `manuscripts` in the Continua project. It must not be
committed to this public repository. Website chapter delivery uses the separate
`books` bucket and does not serve the full manuscript.

Current version: September 20, 2026. This revision fixes the Chapter 3 /
Chapter 4 empathy inconsistency (the Peter Singer example). Storage object:

| Object | Bytes | SHA-256 |
| --- | ---: | --- |
| `2026-09-20/Continua_Book.docx` | 7243720 | `bfba3e9335da01876bada8df3db7a02816029904f548a077421fb4e8bb5d3089` |

The DOCX is the single source; there is no derived Markdown copy. Earlier
dated folders in the bucket (for example `2026-09-13/`) are superseded backups;
do not use them. To publish a new version, upload it to a new dated folder as
`Continua_Book.docx` and replace this table and the constants at the top of
`scripts/fetch-manuscript.mjs`.

## Retrieve for manuscript-grounded work

With Node 20.6+ and authorized server credentials in `.env.local`, run:

```sh
node --env-file=.env.local scripts/fetch-manuscript.mjs
```

This verifies the file against the hash above and writes it into ignored
`docs/manuscript/private/`. Read that source before making manuscript-grounded
changes. If credentials are unavailable, ask a collaborator for private access;
do not infer the book's contents from excerpts or commit a copy to Git.

Do not grant public/anonymous storage access, publish signed links, or put the
service-role key in client code. The bucket is private and anonymous downloads
were verified denied during migration.

## Public-history cleanup

The full manuscript files were removed from `main` and its reachable history on
September 20, 2026, after private backups were verified. The manuscript-bearing
PR merge ref was refreshed onto clean history. GitHub still served old commit
URLs afterward; a Support request has been submitted for the remaining cached
or orphaned copies. Exposure is not fully resolved until GitHub removes those
copies or confirms the available remedy.

Collaborators with the old history should preserve their uncommitted work and
start from a fresh clone, or carefully rebase only their own changes onto the
clean `origin/main`. Do not merge the old main history back into the repository.
Copies already downloaded cannot be recalled by rewriting Git history.
