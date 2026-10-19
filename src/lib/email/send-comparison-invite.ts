import { resend } from '@/lib/resend/client'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'reply@continua.info'

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

// The invitation email. It names who invited them and says what happens next.
// It never contains anyone's scores: nothing is shown until the invitee has
// seen their own result and chosen to share it.
export function comparisonInviteContent(inviterName: string, inviteeEmail: string, link: string) {
  const subject = `${inviterName} invited you to compare results on Continua`
  const lines = [
    `${inviterName} would like to compare Continua results with you.`,
    'Continua is a short personality questionnaire based on the book Continua: How Opposites Align. Your answers are private. After you take it and see your own result, you choose whether to share it with ' +
      `${inviterName}. If you do, you will each see both results side by side. Either of you can end the comparison at any time.`,
    `To start, open this link and sign in with this email address (${inviteeEmail}):`,
    link,
    'If you were not expecting this, you can ignore this email. Nothing is shared unless you accept.',
  ]
  const text = lines.join('\r\n\r\n')
  const html = lines
    .map((line) =>
      line === link
        ? `<p><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p>`
        : `<p>${escapeHtml(line)}</p>`
    )
    .join('\n')
  return { subject, text, html }
}

export async function sendComparisonInvite(args: {
  inviterName: string
  inviterEmail: string
  inviteeEmail: string
  link: string
}): Promise<boolean> {
  const { subject, text, html } = comparisonInviteContent(args.inviterName, args.inviteeEmail, args.link)
  try {
    const { error } = await resend.emails.send({
      from: `Continua <${FROM_EMAIL}>`,
      to: args.inviteeEmail,
      replyTo: args.inviterEmail,
      subject,
      text,
      html,
    })
    return !error
  } catch {
    return false
  }
}
