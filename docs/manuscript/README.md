# Private manuscript source

The full manuscript is unpublished source material stored in the **private**
Supabase Storage bucket `manuscripts` in the Continua project. It must not be
committed to this public repository. Website chapter delivery uses the separate
`books` bucket and does not serve the full manuscript.

Version: September 13, 2026. Storage objects:

| Object | Bytes | SHA-256 |
| --- | ---: | --- |
| `2026-09-13/Continua_Book_2026-09-13.docx` | 7243547 | `daf246cc79cbf37d0bd158ed645f5dffa248e1c9114f22376c6ffff634d58159` |
| `2026-09-13/continua-manuscript.md` | 281534 | `67a870771abe55c9600ddcf5c7e1400fc148eb9e1591f9ad96e77ea8cd12a86e` |

The DOCX is the supplied source; Markdown is its reading copy, not a replacement
editorial authority. Keep future versions separately and record their hashes.

## Retrieve for manuscript-grounded work

With Node 20.6+ and authorized server credentials in `.env.local`, run:

```sh
node --env-file=.env.local scripts/fetch-manuscript.mjs
```

This verifies both files against the hashes above and writes them into ignored
`docs/manuscript/private/`. Read that source before making manuscript-grounded
changes. If credentials are unavailable, ask a collaborator for private access;
do not infer the book's contents from excerpts or commit a copy to Git.

Do not grant public/anonymous storage access, publish signed links, or put the
service-role key in client code. The bucket is private and anonymous downloads
were verified denied during migration.

## Public-history cleanup

The full manuscript files were removed from `main` and its reachable history on
September 20, 2026, after private backups were verified. GitHub still served old
commit URLs after the rewrite; cached views and a stale pull-request merge ref
require GitHub-side cleanup before the exposure can be considered resolved.

Collaborators with the old history should preserve their uncommitted work and
start from a fresh clone, or carefully rebase only their own changes onto the
clean `origin/main`. Do not merge the old main history back into the repository.
Copies already downloaded cannot be recalled by rewriting Git history.
