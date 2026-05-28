import { resend } from '@/lib/resend/client';
import VerificationEmail from '@/emails/verification-email';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'reply@continua.info';
const REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO_EMAIL || 'albhy@continua.info';

interface SendVerificationEmailParams {
  to: string;
  name: string;
  token: string;
}

/**
 * Send a verification email to a contact.
 *
 * @param params - Email recipient, name, and verification token
 * @returns Resend API response data
 * @throws Error if email sending fails
 */
export async function sendVerificationEmail({
  to,
  name,
  token,
}: SendVerificationEmailParams) {
  // Build full verification URL
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify/${token}`;

  try {
    // Send email using Resend with React Email template
    const { data, error } = await resend.emails.send({
      from: `Continua <${FROM_EMAIL}>`,
      to,
      replyTo: REPLY_TO_EMAIL,
      subject: 'Verify your email — Continua',
      react: VerificationEmail({ name, verificationUrl }),
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}
