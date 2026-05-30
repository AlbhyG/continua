'use server'

import { createClient } from '@/lib/supabase/server'
import { encryptPdf } from '@/lib/pdf/encrypt'
import {
  sendContactNotificationEmail,
  sendContactPdfEmail,
} from '@/lib/email/send-contact-delivery'
import { sendServiceSms } from '@/lib/sms/twilio'

const CONTACT_PDF_STORAGE_PATH =
  process.env.CONTACT_PDF_STORAGE_PATH || null
const PDF_OWNER_PASSWORD =
  process.env.PDF_OWNER_PASSWORD || 'change-this-owner-password'
const VALID_ROLES = ['Agent', 'Publisher', 'Therapist', 'Interested Reader']
const ROLE_PDF_PATHS: Record<string, string> = {
  Agent: 'agents.pdf',
  Publisher: 'publishers.pdf',
  Therapist: 'therapists.pdf',
  'Interested Reader': 'therapists.pdf',
}
const SMS_LINK_EXPIRY_SECONDS = 60 * 60 * 24 * 7

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
      : Array.from(new Set(normalizedRoles.map((role) => ROLE_PDF_PATHS[role])))

    if (!cleanEmail) {
      const smsResult = await sendPdfLinksSms({
        supabase,
        phone: cleanPhone,
        filesToSend,
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
        supabase,
        phone: cleanPhone,
        email: cleanEmail,
        filesToSend,
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
  supabase,
  phone,
  email,
  filesToSend,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  phone: string | null
  email: string
  filesToSend: string[]
}) {
  if (!phone) {
    return { sent: false, error: null }
  }

  try {
    const links = await createSignedPdfLinks({ supabase, filesToSend })
    await sendPdfLinkMessages({
      phone,
      prefix: `Continua: your requested PDF was sent to ${email}. Text access links expire in 7 days.`,
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
  supabase,
  phone,
  filesToSend,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  phone: string | null
  filesToSend: string[]
}) {
  if (!phone) {
    return { sent: false, error: null }
  }

  try {
    const links = await createSignedPdfLinks({ supabase, filesToSend })
    await sendPdfLinkMessages({
      phone,
      prefix: 'Continua: we received your book/PDF request. Your access links expire in 7 days.',
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

async function createSignedPdfLinks({
  supabase,
  filesToSend,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  filesToSend: string[]
}) {
  return Promise.all(
    filesToSend.map(async (filePath) => {
      const { data, error } = await supabase.storage
        .from('books')
        .createSignedUrl(filePath, SMS_LINK_EXPIRY_SECONDS)

      if (error || !data?.signedUrl) {
        throw new Error(`Could not create SMS PDF link: ${filePath}`)
      }

      return {
        label: filePath.replace(/\.pdf$/i, ''),
        url: data.signedUrl,
      }
    })
  )
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
    const intro =
      links.length === 1
        ? `${prefix} PDF:`
        : `${prefix} ${link.label} PDF (${index + 1}/${links.length}):`

    await sendServiceSms({
      to: phone,
      body: `${intro} ${link.url} Reply STOP to opt out or HELP for help.`,
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
