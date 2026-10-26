import { resend } from '@/lib/resend/client'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'reply@continua.info'

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

// The invitation email. It names who invited them and says what happens next.
// It never contains anyone's scores: nothing is shown until the invitee has
// seen their own result and chosen to share it.
// An optional personal note (already cleaned by cleanInviteNote: plain text,
// short, no links) appears right after the first line, labeled as the
// inviter's own words.
export function comparisonInviteContent(
  inviterName: string,
  inviteeEmail: string,
  link: string,
  note: string | null = null
) {
  const subject = `${inviterName} invited you to compare results on Continua`
  const noteHeading = `A note from ${inviterName}:`
  const lines = [
    `${inviterName} would like to compare Continua results with you.`,
    ...(note ? [noteHeading, note] : []),
    'Continua is a short personality questionnaire based on the book Continua: How Opposites Align. Your answers are private. After you take it and see your own result, you choose whether to compare with ' +
      `${inviterName}. If you do, you will each see both results side by side, always using each person's most recent assessment. Either of you can end the comparison at any time.`,
    `To start, open this link and sign in with this email address (${inviteeEmail}):`,
    link,
    'If you were not expecting this, you can ignore this email. Nothing is shared unless you accept.',
  ]
  const text = lines.join('\r\n\r\n').replace(/\r?\n/g, '\r\n')
  const html = lines
    .map((line) => {
      if (line === link) return `<p><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p>`
      if (note && line === noteHeading) return `<p style="margin-bottom:4px"><b>${escapeHtml(line)}</b></p>`
      if (note && line === note) {
        return `<blockquote style="margin:0 0 16px;padding:8px 12px;border-left:3px solid #ccc;white-space:pre-line">${escapeHtml(line)}</blockquote>`
      }
      return `<p>${escapeHtml(line)}</p>`
    })
    .join('\n')
  return { subject, text, html }
}

export async function sendComparisonInvite(args: {
  inviterName: string
  inviterEmail: string
  inviteeEmail: string
  link: string
  note?: string | null
}): Promise<boolean> {
  const { subject, text, html } = comparisonInviteContent(args.inviterName, args.inviteeEmail, args.link, args.note ?? null)
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
