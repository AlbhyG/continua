import { test, expect } from '@playwright/test'
import { safeNextPath, emailReturnPath } from '../src/lib/auth/return-path'

test('return destinations preserve path, query and fragment on either site origin', () => {
  for (const value of ['/quiz/take/3?person=4#question-8', 'https://continua.info/quiz/take/3?person=4#question-8', 'https://www.continua.info/quiz/take/3?person=4#question-8']) {
    expect(safeNextPath(value)).toBe('/quiz/take/3?person=4#question-8')
  }
  const callback = new URL('https://www.continua.info/auth/callback')
  callback.searchParams.set('next', '/quiz/take/3?person=4#question-8')
  expect(emailReturnPath(callback.toString())).toBe('/quiz/take/3?person=4#question-8')
})

test('missing, external, malformed and recursive destinations go home', () => {
  for (const value of [null, '', '//evil.example', '/a/..//evil.example', '/%2e%2e//evil.example', '/\\evil.example', '/\nevil.example', 'https://continua.info.evil.example/path', 'https://continua.info@evil.example', 'http://continua.info/path', 'javascript:alert(1)', '/login?next=/login', '/auth/complete', 'https://evil.example/path']) {
    expect(safeNextPath(value)).toBe('/')
  }
  expect(emailReturnPath('https://evil.example/auth/callback?next=/my-info')).toBe('/')
})
