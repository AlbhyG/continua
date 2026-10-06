import { resend } from '@/lib/resend/client'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'reply@continua.info'
const REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO_EMAIL || 'albhy@continua.info'
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'albhy@continua.info'

export async function sendContactPdfEmail({
  to,
  name,
  attachments,
}: {
  to: string
  name: string
  attachments: Array<{ filename: string; content: Uint8Array }>
}) {
  const text = [
    `Hi ${name},`,
    '',
    'Thank you for your interest in Continua. The first chapter is attached.',
    '',
    'Feel free to pass it along. Anyone can also request their own copy at continua.info.',
    '',
    'If you would like to discuss the book or have questions, simply reply to this email.',
    '',
    'Albhy Galuten',
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thank you for your interest in Continua. The first chapter is attached.</p>
      <p>Feel free to pass it along. Anyone can also request their own copy at <a href="https://continua.info">continua.info</a>.</p>
      <p>If you would like to discuss the book or have questions, simply reply to this email.</p>
      <p>Albhy Galuten</p>
    </div>
  `

  const { data, error } = await sendEmailWithRetry({
    from: `Continua <${FROM_EMAIL}>`,
    to,
    replyTo: REPLY_TO_EMAIL,
    subject: 'Your first chapter of Continua',
    html,
    text,
    attachments: attachments.map((attachment) => ({
      filename: attachment.filename,
      content: Buffer.from(attachment.content),
      contentType: 'application/pdf',
    })),
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function sendContactNotificationEmail({
  name,
  email,
  phone,
  roles,
  status,
  filesSent,
  error,
}: {
  name: string
  email: string | null
  phone: string | null
  roles: string[]
  status: string
  filesSent: string[]
  error?: string
}) {
  const body = [
    `Name: ${name}`,
    `Email: ${email || '(none)'}`,
    `Phone: ${phone || '(none)'}`,
    `Roles: ${roles.join(', ')}`,
    `Delivery status: ${status}`,
    `Files sent: ${filesSent.length ? filesSent.join(', ') : '(none)'}`,
    error ? `Error: ${error}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const { data, error: resendError } = await sendEmailWithRetry({
    from: `Continua <${FROM_EMAIL}>`,
    to: NOTIFY_EMAIL,
    replyTo: email || REPLY_TO_EMAIL,
    subject: `New Continua registration: ${name} (${roles.join(', ')})`,
    text: body,
  })

  if (resendError) {
    throw new Error(resendError.message)
  }

  return data
}

async function sendEmailWithRetry(
  payload: Parameters<typeof resend.emails.send>[0]
) {
  let lastResult: Awaited<ReturnType<typeof resend.emails.send>> | undefined

  for (let attempt = 0; attempt < 3; attempt += 1) {
    lastResult = await resend.emails.send(payload)
    if (!lastResult.error || !isRetryableResendError(lastResult.error)) {
      return lastResult
    }
    await new Promise((resolve) => setTimeout(resolve, 750 * (attempt + 1)))
  }

  if (!lastResult) {
    throw new Error('Email send was not attempted')
  }

  return lastResult
}

function isRetryableResendError(error: { message?: string; statusCode?: number | null }) {
  const statusCode = error.statusCode || 0
  return statusCode >= 500 || error.message?.toLowerCase().includes('internal server error') === true
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
