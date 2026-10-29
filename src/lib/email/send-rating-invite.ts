import { resend } from '@/lib/resend/client'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'reply@continua.info'

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

// Asks someone to rate the person who invited them. It explains what they'll
// be asked, that "Can't tell" is fine, and that they choose to be named or
// anonymous. A personal note (already cleaned) appears after the first line.
export function ratingInviteContent(subjectName: string, raterEmail: string, link: string, note: string | null = null) {
  const subject = `${subjectName} would like to know how you see them`
  const noteHeading = `A note from ${subjectName}:`
  const lines = [
    `${subjectName} has asked you to answer a short set of questions about them on Continua, to see how the people who know them see them.`,
    ...(note ? [noteHeading, note] : []),
    `It takes about five to seven minutes. Answer from your own experience of ${subjectName}, and choose "Can't tell" for anything you don't know. Before you submit, you choose whether ${subjectName} sees your answers under your name or only as part of an anonymous average.`,
    `To start, open this link and sign in with this email address (${raterEmail}):`,
    link,
    'If you were not expecting this, you can ignore this email. Nothing is shared unless you answer and submit.',
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

export async function sendRatingInvite(args: {
  subjectName: string
  subjectEmail: string
  raterEmail: string
  link: string
  note?: string | null
}): Promise<boolean> {
  const { subject, text, html } = ratingInviteContent(args.subjectName, args.raterEmail, args.link, args.note ?? null)
  try {
    const { error } = await resend.emails.send({
      from: `Continua <${FROM_EMAIL}>`,
      to: args.raterEmail,
      replyTo: args.subjectEmail,
      subject,
      text,
      html,
    })
    return !error
  } catch {
    return false
  }
}
