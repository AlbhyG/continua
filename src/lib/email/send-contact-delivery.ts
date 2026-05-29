import { resend } from '@/lib/resend/client'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'reply@continua.info'
const REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO_EMAIL || 'albhy@continua.info'
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'albhy@continua.info'

export async function sendContactPdfEmail({
  to,
  name,
  password,
  attachments,
}: {
  to: string
  name: string
  password: string
  attachments: Array<{ filename: string; content: Uint8Array }>
}) {
  const text = [
    `Hi ${name},`,
    '',
    `Thank you for your interest in Continua. Your requested ${attachments.length === 1 ? 'PDF is' : 'PDFs are'} attached.`,
    '',
    `Your PDF password is: ${password}`,
    '',
    'This copy is intended for you. Please ask anyone else who is interested to register at continua.info for their own copy.',
    '',
    'If you would like to discuss the book or have questions, simply reply to this email.',
    '',
    'Albhy Galuten',
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thank you for your interest in Continua. Your requested ${attachments.length === 1 ? 'PDF is' : 'PDFs are'} attached.</p>
      <p><strong>Your PDF password is:</strong> ${escapeHtml(password)}</p>
      <p>This copy is intended for you. Please ask anyone else who is interested to register at <a href="https://continua.info">continua.info</a> for their own copy.</p>
      <p>If you would like to discuss the book or have questions, simply reply to this email.</p>
      <p>Albhy Galuten</p>
    </div>
  `

  const { data, error } = await sendEmailWithRetry({
    from: `Continua <${FROM_EMAIL}>`,
    to,
    replyTo: REPLY_TO_EMAIL,
    subject: 'Your Continua PDF',
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
