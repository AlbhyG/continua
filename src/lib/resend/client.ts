import { Resend } from 'resend'

// Server-only client - never import in Client Components
export const resend = new Resend(process.env.RESEND_API_KEY)
