#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// Current manuscript revision. Update all three when a new version is uploaded.
const version = '2026-09-20'
const name = 'Continua_Book.docx'
const hash = 'bfba3e9335da01876bada8df3db7a02816029904f548a077421fb4e8bb5d3089'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY securely.')
const directory = new URL('../docs/manuscript/private/', import.meta.url)
await mkdir(directory, { recursive: true, mode: 0o700 })
const response = await fetch(`${url.replace(/\/$/, '')}/storage/v1/object/authenticated/manuscripts/${version}/${name}`, {
  headers: { Authorization: `Bearer ${key}`, apikey: key },
})
if (!response.ok) throw new Error(`Private manuscript retrieval failed (${response.status}).`)
const bytes = Buffer.from(await response.arrayBuffer())
if (createHash('sha256').update(bytes).digest('hex') !== hash) throw new Error(`Checksum mismatch: ${name}`)
await writeFile(new URL(name, directory), bytes, { mode: 0o600 })
console.log(`Verified ${fileURLToPath(new URL(name, directory))}`)
