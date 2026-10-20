import { z } from 'zod'

const schema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(100).regex(/^[^\r\n]+$/, 'Please enter your name on one line.'),
  email: z.string().trim().email('Please enter a valid email address.').max(254).transform((value) => value.toLowerCase()),
  message: z.string().trim().min(1, 'Please enter a message.').max(5000, 'Please keep your message under 5,000 characters.'),
  website: z.string().max(200).optional().default(''),
  requestId: z.string().uuid(),
})

export type InquiryDelivery = {
  to: 'contact@continua.info'
  replyTo: string
  subject: string
  text: string
}

export async function deliverContactInquiry(raw: unknown, dependencies: {
  allowRequest: (requestId: string) => Promise<boolean>
  send: (email: InquiryDelivery, requestId: string) => Promise<void>
}): Promise<{ success: boolean; error?: string }> {
  const parsed = schema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || 'Please check the form.' }
  const { name, email, message, website, requestId } = parsed.data
  if (website) return { success: true }
  try {
    if (!await dependencies.allowRequest(requestId)) return { success: false, error: 'Please wait a minute before sending another message.' }
    // Each paragraph is one continuous line; preserve intentional paragraph breaks.
    const paragraphs = message.split(/\r?\n\s*\r?\n/).map((paragraph) => paragraph.replace(/\r?\n/g, ' '))
    await dependencies.send({
      to: 'contact@continua.info',
      replyTo: email,
      subject: `Continua inquiry from ${name}`,
      text: [`Name: ${name}`, `Email: ${email}`, ...paragraphs].join('\r\n\r\n'),
    }, requestId)
    return { success: true }
  } catch {
    return { success: false, error: 'We couldn’t send your message. Please try again in a minute.' }
  }
}
