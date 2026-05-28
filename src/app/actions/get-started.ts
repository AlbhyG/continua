'use server'

import { createClient } from '@/lib/supabase/server'
import { encryptPdf } from '@/lib/pdf/encrypt'
import {
  sendContactNotificationEmail,
  sendContactPdfEmail,
} from '@/lib/email/send-contact-delivery'

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

export async function getStartedAction(data: {
  name: string
  email?: string
  phone?: string
  roles: string[]
}): Promise<{ success: boolean; error?: string }> {
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

    if (!cleanEmail) {
      if (contactId) {
        await supabase.from('contact_deliveries').insert({
          contact_id: contactId,
          roles: normalizedRoles,
          delivery_method: 'manual',
          status: 'manual_follow_up',
          recipient_email: null,
          recipient_phone: cleanPhone,
          password_identifier: cleanPhone,
          files_sent: [],
        })
      }
      await sendContactNotificationEmail({
        name: cleanName,
        email: null,
        phone: cleanPhone,
        roles: normalizedRoles,
        status: 'manual_follow_up',
        filesSent: [],
      })
      return { success: true }
    }

    const password = cleanEmail || cleanPhone
    if (!password) {
      return { success: false, error: 'Email or phone is required' }
    }

    try {
      const filesToSend = CONTACT_PDF_STORAGE_PATH
        ? [CONTACT_PDF_STORAGE_PATH]
        : Array.from(new Set(normalizedRoles.map((role) => ROLE_PDF_PATHS[role])))

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

      await sendContactPdfEmail({
        to: cleanEmail,
        name: cleanName,
        password: password.toLowerCase(),
        attachments,
      })

      if (contactId) {
        await supabase.from('contact_deliveries').insert({
          contact_id: contactId,
          roles: normalizedRoles,
          delivery_method: 'email',
          status: 'sent',
          recipient_email: cleanEmail,
          recipient_phone: cleanPhone,
          password_identifier: password.toLowerCase(),
          files_sent: filesToSend,
          sent_at: new Date().toISOString(),
        })
      }

      await sendContactNotificationEmail({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        roles: normalizedRoles,
        status: 'sent',
        filesSent: filesToSend,
      })

      return { success: true }
    } catch (deliveryError) {
      const message =
        deliveryError instanceof Error ? deliveryError.message : 'Delivery failed'
      if (contactId) {
        await supabase.from('contact_deliveries').insert({
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
      await sendContactNotificationEmail({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        roles: normalizedRoles,
        status: 'error',
        filesSent: [],
        error: message,
      })
      console.error('Get started delivery error:', message)
      return { success: false, error: 'We saved your information, but the PDF could not be sent yet.' }
    }
  } catch (err) {
    console.error('Get started unexpected error:', err)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
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
