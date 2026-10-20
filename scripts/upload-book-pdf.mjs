#!/usr/bin/env node
// Upload (or replace) a book PDF in the private Supabase `books` bucket.
//
// Usage:
//   node scripts/upload-book-pdf.mjs <local-file.pdf> <remote-name.pdf>
//
// Examples:
//   node scripts/upload-book-pdf.mjs ~/Downloads/sampler.pdf  sampler.pdf
//   node scripts/upload-book-pdf.mjs ~/Downloads/proposal.pdf proposal.pdf
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. The script
// reads them from the environment, falling back to .env.local in the repo root.

import { readFileSync, existsSync } from 'node:fs'
import { resolve, basename } from 'node:path'

const BUCKET = 'books'

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match) continue
    const key = match[1]
    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

async function main() {
  loadEnvLocal()

  const [localFile, remoteNameArg] = process.argv.slice(2)
  if (!localFile) {
    console.error('Usage: node scripts/upload-book-pdf.mjs <local-file.pdf> [remote-name.pdf]')
    process.exit(1)
  }
  const remoteName = remoteNameArg || basename(localFile)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
        'Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase dashboard -> Project Settings -> API -> service_role).'
    )
    process.exit(1)
  }

  const filePath = resolve(localFile)
  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    process.exit(1)
  }
  const body = readFileSync(filePath)

  const endpoint = `${url.replace(/\/$/, '')}/storage/v1/object/${BUCKET}/${encodeURIComponent(remoteName)}`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/pdf',
      'x-upsert': 'true',
    },
    body,
  })

  if (!res.ok) {
    console.error(`Upload failed (${res.status}): ${await res.text()}`)
    process.exit(1)
  }

  console.log(`Uploaded ${filePath} -> ${BUCKET}/${remoteName} (${body.length} bytes)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
