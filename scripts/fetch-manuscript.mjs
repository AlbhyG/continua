#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const files = [
  ['Continua_Book_2026-09-13.docx', 'daf246cc79cbf37d0bd158ed645f5dffa248e1c9114f22376c6ffff634d58159'],
  ['continua-manuscript.md', '67a870771abe55c9600ddcf5c7e1400fc148eb9e1591f9ad96e77ea8cd12a86e'],
]
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY securely.')
const directory = new URL('../docs/manuscript/private/', import.meta.url)
await mkdir(directory, { recursive: true, mode: 0o700 })
for (const [name, hash] of files) {
  const response = await fetch(`${url.replace(/\/$/, '')}/storage/v1/object/authenticated/manuscripts/2026-09-13/${name}`, {
    headers: { Authorization: `Bearer ${key}`, apikey: key },
  })
  if (!response.ok) throw new Error(`Private manuscript retrieval failed (${response.status}).`)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (createHash('sha256').update(bytes).digest('hex') !== hash) throw new Error(`Checksum mismatch: ${name}`)
  await writeFile(new URL(name, directory), bytes, { mode: 0o600 })
  console.log(`Verified ${fileURLToPath(new URL(name, directory))}`)
}
