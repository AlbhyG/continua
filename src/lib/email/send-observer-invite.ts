import { resend } from '@/lib/resend/client'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'reply@continua.info'

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

// The invitation to describe someone. It says who asked, what they will and
// won't see, and that the rater decides at the end whether their name is
// shown. It contains no scores. The link is personal to this recipient.
// An optional note (cleaned by cleanInviteNote: plain text, short, no links)
// appears after the first line, labeled as the inviter's own words.
export function observerInviteContent(inviterName: string, link: string, note: string | null = null) {
  const subject = `${inviterName} would like to know how you see them`
  const noteHeading = `A note from ${inviterName}:`
  const lines = [
    `${inviterName} is using Continua, a short personality questionnaire based on the book Continua: How Opposites Align, and would like to know how you see them.`,
    ...(note ? [noteHeading, note] : []),
    `You'll read 36 short statements about ${inviterName} and say how well each describes them. "Can't tell" is always an option. It takes about five minutes and you don't need an account.`,
    `${inviterName} will see your answers only as six overall scores, never your answer to any single statement. At the end, you choose whether ${inviterName} sees your name with your scores or only as part of an anonymous average.`,
    'This link is just for you:',
    link,
    'If you were not expecting this, you can ignore this email. The invitation is deleted after 30 days.',
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

export async function sendObserverInvite(args: {
  inviterName: string
  inviterEmail: string
  inviteeEmail: string
  link: string
  note?: string | null
}): Promise<boolean> {
  const { subject, text, html } = observerInviteContent(args.inviterName, args.link, args.note ?? null)
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
