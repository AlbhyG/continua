'use server'

import { createClient } from '@/lib/supabase/server'
import { encryptPdf } from '@/lib/pdf/encrypt'
import {
  sendContactNotificationEmail,
  sendContactPdfEmail,
} from '@/lib/email/send-contact-delivery'
import { sendServiceSms } from '@/lib/sms/twilio'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  bookLabel,
  derivePdfPassword,
  generatePdfLinkToken,
} from '@/lib/pdf/links'

const CONTACT_PDF_STORAGE_PATH =
  process.env.CONTACT_PDF_STORAGE_PATH || null
const PDF_OWNER_PASSWORD =
  process.env.PDF_OWNER_PASSWORD || 'change-this-owner-password'
const VALID_ROLES = ['Agent', 'Publisher', 'Therapist', 'Interested Reader']
// The Sampler goes to everyone. The Book Proposal goes only to Agents/Publishers.
const SAMPLER_PDF = 'sampler.pdf'
const PROPOSAL_PDF = 'proposal.pdf'
const ROLE_PDF_PATHS: Record<string, string[]> = {
  Agent: [SAMPLER_PDF, PROPOSAL_PDF],
  Publisher: [SAMPLER_PDF, PROPOSAL_PDF],
  Therapist: [SAMPLER_PDF],
  'Interested Reader': [SAMPLER_PDF],
}
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://continua.info'

export async function getStartedAction(data: {
  name: string
  email?: string
  phone?: string
  roles: string[]
}): Promise<{
  success: boolean
  error?: string
  deliveryMethod?: 'email' | 'manual'
  smsSent?: boolean
}> {
  const { name, email, phone, roles } = data

  if (!name.trim()) {
    return { success: false, error: 'Name is required' }
  }
  if (!email?.trim() && !phone?.trim()) {
    return { success: false, error: 'Email or phone is required' }
  }
  const normalizedRoles = roles.filter((role) => VALID_ROLES.includes(role))
  if (normalizedRoles.length === 0) {
    return { success: false, error: 'At least one role is required' }
  }

  try {
    const supabase = await createClient()
    const cleanName = name.trim()
    const cleanEmail = email?.trim().toLowerCase() || null
    const cleanPhone = phone?.trim() || null

    const { contactId, error: contactError } = await upsertContact({
      supabase,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      roles: normalizedRoles,
    })

    if (contactError) {
      console.error('Get started DB error:', JSON.stringify(contactError, null, 2))
      return { success: false, error: 'Something went wrong. Please try again.' }
    }

    const filesToSend = CONTACT_PDF_STORAGE_PATH
      ? [CONTACT_PDF_STORAGE_PATH]
      : Array.from(new Set(normalizedRoles.flatMap((role) => ROLE_PDF_PATHS[role])))

    if (!cleanEmail) {
      const smsResult = await sendPdfLinksSms({
        phone: cleanPhone,
        filesToSend,
        userPassword: derivePdfPassword(null, cleanPhone),
        contactId,
      })

      let notificationId: string | null = null
      try {
        const notification = await sendContactNotificationEmail({
          name: cleanName,
          email: null,
          phone: cleanPhone,
          roles: normalizedRoles,
          status: smsResult.sent
            ? 'sms_pdf_links_sent'
            : 'manual_follow_up',
          filesSent: smsResult.sent ? filesToSend : [],
          error: smsResult.error ?? undefined,
        })
        notificationId = notification?.id ?? null
      } catch (notificationError) {
        console.error('Contact notification error:', notificationError)
      }

      if (contactId) {
        await logContactDelivery(supabase, {
          contact_id: contactId,
          roles: normalizedRoles,
          delivery_method: 'manual',
          status: smsResult.sent ? 'sent' : 'manual_follow_up',
          recipient_email: null,
          recipient_phone: cleanPhone,
          password_identifier: cleanPhone,
          files_sent: smsResult.sent ? filesToSend : [],
          resend_notification_id: notificationId,
        })
      }
      return { success: true, deliveryMethod: 'manual', smsSent: smsResult.sent }
    }

    const password = cleanEmail || cleanPhone
    if (!password) {
      return { success: false, error: 'Email or phone is required' }
    }

    try {
      const attachments = await Promise.all(
        filesToSend.map(async (filePath) => {
          const { data: sourcePdf, error: sourceError } = await supabase.storage
            .from('books')
            .download(filePath)

          if (sourceError || !sourcePdf) {
            throw new Error(`Source PDF not found: ${filePath}`)
          }

          const encryptedPdf = await encryptPdf({
            input: new Uint8Array(await sourcePdf.arrayBuffer()),
            userPassword: password.toLowerCase(),
            ownerPassword: PDF_OWNER_PASSWORD,
          })

          return {
            filename: `continua-${filePath}`,
            content: encryptedPdf,
          }
        })
      )

      const deliveryEmail = await sendContactPdfEmail({
        to: cleanEmail,
        name: cleanName,
        password: password.toLowerCase(),
        attachments,
      })

      const smsResult = await sendPdfSentSms({
        phone: cleanPhone,
        email: cleanEmail,
        filesToSend,
        userPassword: derivePdfPassword(cleanEmail, cleanPhone),
        contactId,
      })

      let notificationId: string | null = null
      try {
        const notification = await sendContactNotificationEmail({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          roles: normalizedRoles,
          status: smsResult.sent ? 'sent_sms_sent' : 'sent',
          filesSent: filesToSend,
          error: smsResult.error ?? undefined,
        })
        notificationId = notification?.id ?? null
      } catch (notificationError) {
        console.error('Contact notification error:', notificationError)
      }

      if (contactId) {
        await logContactDelivery(supabase, {
          contact_id: contactId,
          roles: normalizedRoles,
          delivery_method: 'email',
          status: 'sent',
          recipient_email: cleanEmail,
          recipient_phone: cleanPhone,
          password_identifier: password.toLowerCase(),
          files_sent: filesToSend,
          sent_at: new Date().toISOString(),
          resend_email_id: deliveryEmail?.id ?? null,
          resend_notification_id: notificationId,
        })
      }

      return { success: true, deliveryMethod: 'email', smsSent: smsResult.sent }
    } catch (deliveryError) {
      const message =
        deliveryError instanceof Error ? deliveryError.message : 'Delivery failed'
      if (contactId) {
        await logContactDelivery(supabase, {
          contact_id: contactId,
          roles: normalizedRoles,
          delivery_method: 'email',
          status: 'error',
          recipient_email: cleanEmail,
          recipient_phone: cleanPhone,
          password_identifier: password.toLowerCase(),
          files_sent: [],
          error: message,
        })
      }
      try {
        await sendContactNotificationEmail({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          roles: normalizedRoles,
          status: 'error',
          filesSent: [],
          error: message,
        })
      } catch (notificationError) {
        console.error('Contact notification error:', notificationError)
      }
      console.error('Get started delivery error:', message)
      return { success: false, error: 'We saved your information, but the PDF could not be sent yet.' }
    }
  } catch (err) {
    console.error('Get started unexpected error:', err)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

async function sendPdfSentSms({
  phone,
  email,
  filesToSend,
  userPassword,
  contactId,
}: {
  phone: string | null
  email: string
  filesToSend: string[]
  userPassword: string
  contactId: number | null
}) {
  if (!phone) {
    return { sent: false, error: null }
  }

  try {
    const links = await createPdfLinks({ filesToSend, userPassword, contactId })
    await sendPdfLinkMessages({
      phone,
      prefix: `Continua: your book link (also emailed to ${email}). Open the PDF using your email address as the password.`,
      links,
    })
    return { sent: true, error: null }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'SMS confirmation failed'
    console.error('Contact SMS error:', message)
    return { sent: false, error: `SMS error: ${message}` }
  }
}

async function sendPdfLinksSms({
  phone,
  filesToSend,
  userPassword,
  contactId,
}: {
  phone: string | null
  filesToSend: string[]
  userPassword: string
  contactId: number | null
}) {
  if (!phone) {
    return { sent: false, error: null }
  }

  try {
    const links = await createPdfLinks({ filesToSend, userPassword, contactId })
    await sendPdfLinkMessages({
      phone,
      prefix:
        'Continua: your book is ready. Open the PDF using your mobile number as the password (digits only, no country code).',
      links,
    })
    return { sent: true, error: null }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'SMS confirmation failed'
    console.error('Contact SMS error:', message)
    return { sent: false, error: `SMS error: ${message}` }
  }
}

// Create one short, unguessable link per file. Each token maps to the file and
// the password the /d/[token] route will encrypt it with on download.
async function createPdfLinks({
  filesToSend,
  userPassword,
  contactId,
}: {
  filesToSend: string[]
  userPassword: string
  contactId: number | null
}) {
  const admin = createAdminClient()
  if (!admin) {
    throw new Error('Service role key not configured for PDF links')
  }

  return Promise.all(
    filesToSend.map(async (filePath) => {
      const token = generatePdfLinkToken()
      const label = bookLabel(filePath)
      const { error } = await admin.from('pdf_links').insert({
        token,
        file_path: filePath,
        user_password: userPassword,
        label,
        contact_id: contactId,
      })
      if (error) {
        throw new Error(`Could not create PDF link: ${filePath}`)
      }
      return { label, url: `${SITE_URL}/d/${token}` }
    })
  )
}

function displayLabel(label: string) {
  return label.charAt(0).toUpperCase() + label.slice(1)
}

async function sendPdfLinkMessages({
  phone,
  prefix,
  links,
}: {
  phone: string
  prefix: string
  links: Array<{ label: string; url: string }>
}) {
  for (const [index, link] of links.entries()) {
    const name = displayLabel(link.label)
    const which =
      links.length === 1 ? name : `${name} (${index + 1}/${links.length})`

    // Keep the URL as the final token. Some phones only linkify a trailing URL
    // and drop the path if other text follows it, leaving a link to the bare
    // domain instead of the PDF.
    await sendServiceSms({
      to: phone,
      body: `${prefix} ${which}. Reply STOP to opt out or HELP for help. ${link.url}`,
    })
  }
}

async function logContactDelivery(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: Record<string, unknown>
) {
  const { error } = await supabase.from('contact_deliveries').insert(payload)
  if (!error) {
    return
  }

  if (isMissingResendColumnError(error)) {
    const {
      resend_email_id: _resendEmailId,
      resend_notification_id: _resendNotificationId,
      ...legacyPayload
    } = payload
    const { error: retryError } = await supabase
      .from('contact_deliveries')
      .insert(legacyPayload)
    if (!retryError) {
      return
    }
    console.error('Contact delivery log error:', JSON.stringify(retryError, null, 2))
    return
  }

  console.error('Contact delivery log error:', JSON.stringify(error, null, 2))
}

async function upsertContact({
  supabase,
  name,
  email,
  phone,
  roles,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  name: string
  email: string | null
  phone: string | null
  roles: string[]
}): Promise<{ contactId: number | null; error: unknown | null }> {
  const { data: contactResult, error: rpcError } = await supabase.rpc(
    'upsert_contact_submission',
    {
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_roles: roles,
    }
  )

  if (!rpcError) {
    return {
      contactId: (contactResult as { contact_id?: number } | null)?.contact_id ?? null,
      error: null,
    }
  }

  if (!isMissingRpcError(rpcError)) {
    return { contactId: null, error: rpcError }
  }

  const payload = {
    email,
    name,
    phone,
    interest_roles: roles,
    signed_up_at: new Date().toISOString(),
  }

  if (email) {
    const { error } = await supabase
      .from('contacts')
      .upsert(payload, { onConflict: 'email' })
    return { contactId: null, error }
  }

  const { error } = await supabase.from('contacts').insert(payload)
  return { contactId: null, error }
}

function isMissingRpcError(error: { code?: string; message?: string }) {
  return (
    error.code === 'PGRST202' ||
    error.message?.includes('upsert_contact_submission') === true
  )
}

function isMissingResendColumnError(error: { code?: string; message?: string }) {
  return (
    error.code === 'PGRST204' &&
    (error.message?.includes('resend_email_id') === true ||
      error.message?.includes('resend_notification_id') === true)
  )
}
