import { test, expect } from '@playwright/test'
import { verifiedDownload } from '../src/lib/pdf/verified-download'
import { GET } from '../src/app/api/download/[bookType]/route'
import { NextRequest } from 'next/server'

test('only a verified result issues a chapter capability, without email in its URL', async () => {
  const saved: unknown[] = []
  const result = await verifiedDownload({ status: 'verified', email: 'Reader@Example.com' }, 'first-chapter.pdf', async link => { saved.push(link) })
  expect(result.success).toBe(true)
  expect(result.downloadUrl).toMatch(/^\/d\/[A-Za-z0-9_-]{11}$/)
  expect(result.password).toBe('reader@example.com')
  expect(saved).toEqual([{ token: result.downloadUrl!.slice(3), file_path: 'first-chapter.pdf', user_password: 'reader@example.com', label: 'first chapter' }])
})

test('expired, invalid and malformed verification results never issue links', async () => {
  for (const result of [null, {}, { status: 'invalid' }, { status: 'expired' }, { status: 'verified' }, { status: 'verified', email: '' }, { status: 'unknown', email: 'reader@example.com' }]) {
    const response = await verifiedDownload(result, 'first-chapter.pdf', async () => { throw new Error('must not save') })
    expect(response.success).toBeUndefined()
    expect(response.downloadUrl).toBeUndefined()
    expect(response.error).toBeTruthy()
  }
})

test('storage failure gives a recovery path instead of a broken download', async () => {
  const response = await verifiedDownload({ status: 'verified', email: 'reader@example.com' }, 'first-chapter.pdf', async () => { throw new Error('database unavailable') })
  expect(response.downloadUrl).toBeUndefined()
  expect(response.error).toContain('homepage')
})

test('legacy email-only download URLs recover without granting access or copying email', async () => {
  const response = await GET(new NextRequest('https://continua.info/api/download/agents?email=reader@example.com'))
  expect(response.status).toBe(303)
  expect(response.headers.get('location')).toBe('https://continua.info/')
})
