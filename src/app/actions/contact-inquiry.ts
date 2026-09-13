'use server'

import { headers } from 'next/headers'
import { createHmac } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend/client'
import { deliverContactInquiry } from '@/lib/email/contact-inquiry'

export async function contactInquiryAction(raw: unknown) {
  // Explicit activation follows mailbox verification; do not accept undeliverable inquiries.
  if (process.env.CONTACT_INQUIRIES_ENABLED !== 'true') {
    return { success: false, error: 'The contact form is not available yet. Please try again later.' }
  }
  const admin = createAdminClient()
  if (!admin || !process.env.RESEND_API_KEY) return { success: false, error: 'The contact form is temporarily unavailable.' }
  const requestHeaders = await headers()
  // Vercel overwrites this header at its trusted edge. The local fallback shares a bucket.
  const ip = requestHeaders.get('x-vercel-forwarded-for')?.split(',')[0].trim() || 'local'
  const senderHash = createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!).update(ip).digest('hex')
  return deliverContactInquiry(raw, {
    allowRequest: async (requestId) => {
      const { data, error } = await admin.rpc('consume_contact_inquiry_limit', { p_sender_hash: senderHash, p_request_id: requestId })
      if (error) {
        console.error('Inquiry rate-limit check failed:', error.code)
        throw new Error('Rate limit unavailable')
      }
      return data === true
    },
    send: async (payload, requestId) => {
      const { error } = await resend.emails.send({
        ...payload,
        from: `Continua <${process.env.RESEND_FROM_EMAIL || 'reply@continua.info'}>`,
      }, { idempotencyKey: `contact-inquiry/${requestId}` })
      if (error) {
        console.error('Inquiry delivery failed:', error.name)
        throw new Error('Delivery failed')
      }
    },
  })
}
