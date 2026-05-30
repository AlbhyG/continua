const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER

type SendSmsInput = {
  to: string
  body: string
}

type TwilioMessageResponse = {
  sid?: string
  error_message?: string | null
  message?: string
  code?: number
}

export async function sendServiceSms({ to, body }: SendSmsInput) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_FROM_NUMBER) {
    throw new Error('Twilio SMS is not configured')
  }

  const password = TWILIO_API_KEY_SECRET || TWILIO_AUTH_TOKEN
  const username = TWILIO_API_KEY_SECRET ? TWILIO_API_KEY_SID : TWILIO_ACCOUNT_SID

  if (!username || !password) {
    throw new Error('Twilio SMS credentials are not configured')
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: normalizePhoneNumber(to),
        From: TWILIO_FROM_NUMBER,
        Body: body,
      }),
    }
  )

  const result = (await response.json()) as TwilioMessageResponse

  if (!response.ok) {
    throw new Error(result.message || result.error_message || 'Twilio SMS send failed')
  }

  return result
}

function normalizePhoneNumber(value: string) {
  const trimmed = value.trim()
  if (trimmed.startsWith('+')) {
    return trimmed
  }

  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 10) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  return trimmed
}
