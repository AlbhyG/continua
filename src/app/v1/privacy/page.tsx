import { redirect } from 'next/navigation'

// The privacy policy has one canonical copy at /privacy.
export default function V1PrivacyPage() {
  redirect('/privacy')
}
