import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { deliverContactInquiry, type InquiryDelivery } from '../src/lib/email/contact-inquiry'

const valid = () => ({ name: ' Test Visitor ', email: 'VISITOR@example.com', message: 'A paragraph that\ncontinues here.\n\nA second paragraph.', website: '', requestId: randomUUID() })

test('inquiries have a fixed recipient, visitor reply-to, and continuous paragraphs', async () => {
  const calls: Array<{ payload: InquiryDelivery; requestId: string }> = []
  const input = valid()
  const result = await deliverContactInquiry({ ...input, to: 'attacker@example.com' }, {
    allowRequest: async () => true,
    send: async (payload, requestId) => { calls.push({ payload, requestId }) },
  })
  expect(result.success).toBe(true)
  expect(calls).toEqual([{ requestId: input.requestId, payload: {
    to: 'contact@continua.info', replyTo: 'visitor@example.com', subject: 'Continua inquiry from Test Visitor',
    text: 'Name: Test Visitor\r\n\r\nEmail: visitor@example.com\r\n\r\nA paragraph that continues here.\r\n\r\nA second paragraph.',
  } }])
})

test('invalid data and honeypot never send or consume the rate limit', async () => {
  const dependencies = { allowRequest: async () => { throw new Error('Must not call limiter') }, send: async () => { throw new Error('Must not send') } }
  for (const change of [{ name: '' }, { name: 'Header\r\nInjection' }, { email: 'bad' }, { message: '' }, { message: 'x'.repeat(5001) }, { requestId: 'bad' }]) {
    expect((await deliverContactInquiry({ ...valid(), ...change }, dependencies)).success).toBe(false)
  }
  expect((await deliverContactInquiry({ ...valid(), website: 'bot' }, dependencies)).success).toBe(true)
})

test('blocked and failed deliveries never report success', async () => {
  let sends = 0
  const send = async () => { sends++; throw new Error('Mail provider failed') }
  expect((await deliverContactInquiry(valid(), { allowRequest: async () => false, send })).success).toBe(false)
  expect(sends).toBe(0)
  expect((await deliverContactInquiry(valid(), { allowRequest: async () => true, send })).success).toBe(false)
  expect(sends).toBe(1)
})
