import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Continua',
  description: 'Continua Privacy Policy — what information we collect, how we use it, and your rights.',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[32px] font-bold mb-2">Privacy Policy</h1>
      <p className="text-[14px] mb-8 opacity-70">Continua | Effective Date: February 16, 2026</p>

      <div className="text-[18px] md:text-[20px] leading-[1.6] space-y-8">
        <p>
          Continua (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains what personal information we collect when you use our website and services, how we use it, and your rights with respect to it.
        </p>
        <p>
          By creating an account or using our services, you agree to the practices described in this policy.
        </p>

        <section>
          <h2 className="text-[24px] font-bold mb-3">1. What Information We Collect</h2>
          <p>We collect only the information you provide directly to us:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Name</strong> — so we can address you appropriately within the platform.</li>
            <li><strong>Email address</strong> — to create and manage your account, and to communicate with you about your use of Continua.</li>
            <li><strong>Phone number</strong> — provided optionally by users who prefer to receive service communications by text message. We will only contact you by text if you provide your number and indicate that preference.</li>
          </ul>
          <p className="mt-3">
            We do not collect payment information, government-issued identification, or sensitive personal data. We do not use third-party tracking pixels or behavioral advertising tools.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">2. How We Use Your Information</h2>
          <p>We use your name, email address, and phone number (where provided) solely for the following purposes:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Creating and maintaining your account.</li>
            <li>Sending you service-related communications (e.g., account confirmations, password resets) by email or, if you have opted in, by text message.</li>
            <li>Sending SMS/text messages only to users who have explicitly opted in to text communication. You may opt out of text messages at any time by replying STOP to any message we send, or by updating your communication preferences in your account settings.</li>
            <li>Responding to questions or requests you send to us.</li>
            <li>Improving and troubleshooting the Continua platform.</li>
          </ul>
          <p className="mt-3">
            We do not use your information for advertising, profiling for third-party purposes, or any automated decision-making that produces legal or significant effects.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">3. Data Sharing and Disclosure</h2>
          <p>
            We do not sell, rent, trade, or share your personal information with any third parties for their own purposes — ever.
          </p>
          <p className="mt-3">Your information may be disclosed only in the following narrow circumstances:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>To service providers who assist us in operating the platform (e.g., cloud hosting infrastructure), who are contractually bound to use your data only as directed by us and for no other purpose.</li>
            <li>If required by applicable law, regulation, or valid legal process (e.g., a court order), in which case we will notify you to the extent permitted by law.</li>
            <li>In connection with a merger, acquisition, or sale of substantially all of our assets — in which case you will be notified and this policy will continue to apply.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">4. Data Retention</h2>
          <p>
            We retain your name, email address, and phone number (if provided) for as long as your account is active. If you close your account or request deletion, we will delete your personal information within 30 days, except where retention is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">5. Security</h2>
          <p>
            We use industry-standard security measures to protect your information, including encrypted storage and secure data transmission (HTTPS). While no system is perfectly secure, we take reasonable precautions to protect your data from unauthorized access, loss, or disclosure.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">6. Your Rights</h2>
          <p>Depending on where you are located, you may have the following rights regarding your personal information:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Access</strong> — the right to request a copy of the personal information we hold about you.</li>
            <li><strong>Correction</strong> — the right to request that we correct inaccurate or incomplete information.</li>
            <li><strong>Deletion</strong> — the right to request that we delete your personal information.</li>
            <li><strong>Objection</strong> — the right to object to our processing of your information.</li>
            <li><strong>Portability</strong> — the right to receive your data in a structured, machine-readable format.</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at the email address below. We will respond within 30 days. We do not require you to create an account or pay a fee to exercise your rights.
          </p>
          <p className="mt-3">
            If you are located in the European Union or United Kingdom, you also have the right to lodge a complaint with your local data protection authority.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">7. Children&apos;s Privacy</h2>
          <p>
            Continua is not directed to, and we do not knowingly collect personal information from, individuals under the age of 13. If we become aware that a child under 13 has provided us with personal information, we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">8. International Users</h2>
          <p>
            Continua is operated from the United States. If you are accessing our services from outside the United States, please be aware that your information may be transferred to and processed in the United States, where data protection laws may differ from those in your jurisdiction.
          </p>
          <p className="mt-3">
            We take appropriate measures to ensure that any such transfers comply with applicable legal requirements, including, where applicable, the European Union&apos;s Standard Contractual Clauses.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">9. Cookies and Tracking</h2>
          <p>
            We use only essential cookies necessary to operate the platform (such as session cookies that keep you logged in). We do not use advertising cookies, tracking cookies, or cookies that share data with third parties.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will update the effective date at the top of this page and, for material changes, notify you by email. Your continued use of Continua after any changes constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">11. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:</p>
          <p className="mt-3">
            Continua<br />
            Email: <a href="mailto:privacy@continua.com" className="underline hover:text-accent transition-colors">privacy@continua.com</a><br />
            Website: <a href="https://continua.com" className="underline hover:text-accent transition-colors">https://continua.com</a>
          </p>
        </section>
      </div>
    </main>
  )
}
