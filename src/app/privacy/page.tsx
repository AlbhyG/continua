import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Continua',
  description: 'Continua Privacy Policy — what information we collect, how we use it, and your choices.',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[32px] font-bold mb-2">Privacy Policy</h1>
      <p className="text-[14px] mb-8 opacity-70">Continua | Effective Date: September 21, 2026</p>

      <div className="text-[18px] md:text-[20px] leading-[1.6] space-y-8">
        <p>
          Continua (&ldquo;Continua,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy. This Privacy Policy explains what information we collect when you use continua.info and related Continua services, how we use and disclose that information, how long we retain it, and the choices you may have regarding your information.
        </p>
        <p>
          Continua is a self-reflection and educational tool. It is not a clinical, diagnostic, medical, or therapeutic service.
        </p>
        <section>
          <h2 className="text-[24px] font-bold mb-3">1. Information We Collect</h2>
          <p>
            The information we collect depends on how you use Continua.
          </p>
          <h3 className="text-[20px] font-bold mt-5 mb-2">Information You Provide</h3>
          <p>
            We may collect:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Name and contact information</strong>, including your name, email address and, if you choose to provide it, your phone number.</li>
            <li><strong>Account information</strong>, including information necessary to create and authenticate your account. Continua currently uses passkeys or one-time email links rather than passwords.</li>
            <li><strong>Assessment information</strong>, including the scores generated when you complete a Continua assessment, the version of the questionnaire used, and the date of the assessment. Continua currently stores the resulting scores, not your individual answers to the assessment questions.</li>
            <li><strong>Information you enter about other people</strong>, such as a name and, optionally, an email address, if you choose to create records or groups involving other people. Information entered by you about another person represents information you have provided and should not be understood as information provided, verified, or endorsed by that person.</li>
            <li><strong>Chapter and content requests</strong>, including information about requests to receive book chapters or other Continua materials, the email address or phone number used for delivery, delivery status, and related error information.</li>
            <li><strong>Communications</strong>, including information you provide when you contact us with a question, comment, or request.</li>
          </ul>
          <p className="mt-3">
            Please do not provide information about another person unless you have an appropriate reason and authority to do so.
          </p>
          <h3 className="text-[20px] font-bold mt-5 mb-2">Information Collected Automatically</h3>
          <p>
            When you use Continua, we may also collect or generate limited technical information necessary to operate and protect the service. This may include:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>A randomly generated browser identifier used to associate an assessment with a browser when a person takes an assessment without signing in. This identifier may be stored in a cookie that expires after one year and in local browser storage, which remains until it is cleared, and may allow an assessment to be associated with an account if the user later creates or signs into one.</li>
            <li>Session and authentication information necessary to keep users signed in and operate the service.</li>
            <li>Technical information that may be recorded by Continua or its hosting and infrastructure providers, such as IP address, browser or device information, requested pages, timestamps, and server or request logs. This information may be used for security, abuse prevention, troubleshooting, and operation of the service.</li>
            <li>When the contact form is used, a one-way hash derived from the sender&apos;s IP address may be used to enforce rate limits and prevent abuse.</li>
          </ul>
          <p className="mt-3">
            We do not currently use third-party advertising pixels or behavioral advertising trackers.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">2. How We Use Information</h2>
          <p>
            We use information collected through Continua to:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Provide and operate the Continua website and assessment service.</li>
            <li>Create and manage user accounts.</li>
            <li>Authenticate users and maintain account security.</li>
            <li>Calculate, save, retrieve, and display assessment results.</li>
            <li>Allow users to organize assessments and other records they create.</li>
            <li>Deliver book chapters or other materials requested by users.</li>
            <li>Send service-related communications.</li>
            <li>Respond to questions, comments, privacy requests, and support requests.</li>
            <li>Maintain the security and integrity of the service and prevent abuse.</li>
            <li>Diagnose technical problems and improve the reliability and functionality of Continua.</li>
            <li>Develop, evaluate, and improve the Continua assessment and service, including through analysis of aggregated or de-identified information where appropriate.</li>
            <li>Comply with applicable law and protect our legal rights.</li>
          </ul>
          <p className="mt-3">
            We do not sell or rent personal information.
          </p>
          <p className="mt-3">
            We do not use personal information for third-party behavioral advertising.
          </p>
          <p className="mt-3">
            We do not use Continua assessment information to make decisions that produce legal or similarly significant effects concerning a user.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">3. Assessment Information</h2>
          <p>
            Continua assessments are designed for self-reflection and educational purposes.
          </p>
          <p className="mt-3">
            Assessment results may describe aspects of personality, behavior, tendencies, or interpersonal style within the Continua framework. These results are not medical records, psychological diagnoses, or clinical assessments, and Continua should not be used as a substitute for professional medical, psychological, therapeutic, legal, or other professional advice.
          </p>
          <p className="mt-3">
            Because assessment information can be personal, we treat it as private information and use it only for purposes connected with providing, maintaining, securing, developing, evaluating, and improving the Continua service, as described in this Policy.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">4. Sharing Assessment Results</h2>
          <p>
            Continua allows users to create a link for sharing assessment results with other people.
          </p>
          <p className="mt-3">
            When you choose to create and share such a link, your assessment scores are included in the information contained in the link. Anyone who obtains the link may be able to view the assessment results associated with it.
          </p>
          <p className="mt-3">
            You should therefore share an assessment link only with people you intend to have access to those results. A recipient may also be able to copy, save, forward, or otherwise retain information that you have shared.
          </p>
          <p className="mt-3">
            Do not post a sharing link publicly unless you intend the associated assessment results to be publicly accessible.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">5. Information About Other People</h2>
          <p>
            Continua may currently allow a user to enter the name and other limited information of another person and to associate assessments or groups with that person.
          </p>
          <p className="mt-3">
            Information entered in this way is supplied by the Continua user who created the record. It does not mean that the other person has taken a Continua assessment, consented to the characterization, or verified its accuracy.
          </p>
          <p className="mt-3">
            Users should respect the privacy of other people and should not use Continua to record highly sensitive, confidential, defamatory, harassing, or unlawful information about another person.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">6. How We Disclose Information</h2>
          <p>
            We do not sell, rent, or trade personal information.
          </p>
          <p className="mt-3">
            We may disclose information to service providers that process information on our behalf to operate Continua. These currently include providers of:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Database, authentication, and storage services;</li>
            <li>Website hosting and infrastructure;</li>
            <li>Email delivery; and</li>
            <li>Text-message delivery.</li>
          </ul>
          <p className="mt-3">
            These providers process information as necessary to provide services used to operate Continua and are subject to their applicable terms, privacy obligations, and legal requirements.
          </p>
          <p className="mt-3">
            We may also disclose information:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>At your direction, including when you create or share an assessment-results link;</li>
            <li>When required by applicable law, regulation, subpoena, court order, or other valid legal process;</li>
            <li>When reasonably necessary to protect the security, rights, property, or safety of Continua, our users, or others; or</li>
            <li>In connection with a merger, acquisition, financing, reorganization, sale of assets, or similar business transaction, subject to applicable law.</li>
          </ul>
          <p className="mt-3">
            We do not permit third parties to use Continua assessment information for their own advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">7. Service Providers</h2>
          <p>
            Continua currently uses third-party service providers including Supabase for database, authentication, and storage services; Vercel for website hosting; Resend for email delivery; and Twilio for text-message delivery.
          </p>
          <p className="mt-3">
            These providers may process personal information as necessary to provide their services to Continua. Their handling of information is subject to their own privacy, security, and legal obligations and the terms governing Continua&apos;s use of their services.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">8. Administrator Access</h2>
          <p>
            Authorized Continua administrators may access contact information, account information, assessment information, and related records when reasonably necessary to operate, maintain, secure, troubleshoot, and support the service or respond to user requests.
          </p>
          <p className="mt-3">
            Administrative access is restricted to authorized individuals.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">9. Cookies, Local Storage, and Tracking</h2>
          <p>
            Continua uses cookies and similar browser technologies necessary to provide and maintain the service. These may include:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Authentication and session technologies necessary for account access; and</li>
            <li>A randomly generated identifier stored in a cookie that expires after one year and in local browser storage, which remains until it is cleared, to associate assessments taken without an account with the browser that created them.</li>
          </ul>
          <p className="mt-3">
            Continua does not currently use cookies or tracking technologies for third-party behavioral advertising and does not permit third parties to track users across unrelated websites for advertising through Continua.
          </p>
          <p className="mt-3">
            Because Continua does not currently engage in cross-site behavioral tracking, browser &ldquo;Do Not Track&rdquo; signals do not change how Continua operates.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">10. Email and Text Communications</h2>
          <p>
            We may send email messages necessary to provide services you request, authenticate your account, deliver requested content, respond to you, or provide important information about Continua.
          </p>
          <p className="mt-3">
            If you provide a phone number instead of an email address in order to receive a requested chapter or other content, Continua may send that content to you by text message. Standard message and data rates imposed by your mobile carrier may apply.
          </p>
          <p className="mt-3">
            We will obtain any additional consent required by applicable law before using email addresses or phone numbers for marketing or promotional communications.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">11. Data Retention</h2>
          <p>
            We retain personal information only for as long as reasonably necessary for the purposes described in this Policy, including providing the service, maintaining security, resolving disputes, complying with legal obligations, and enforcing our agreements.
          </p>
          <p className="mt-3">
            Retention periods may differ depending on the type of information and how it is used.
          </p>
          <p className="mt-3">
            Account information and assessment results may be retained while an account remains active. Anonymous assessment information may remain associated with the browser identifier used to create it.
          </p>
          <p className="mt-3">
            When personal information is deleted, some information may remain temporarily in backups or security records until those systems are overwritten or the applicable retention period expires, unless earlier deletion is required by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">12. Security</h2>
          <p>
            We use reasonable administrative, technical, and organizational safeguards designed to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure.
          </p>
          <p className="mt-3">
            Information transmitted between your browser and Continua is protected using encrypted connections (HTTPS), and access to administrative functions is restricted.
          </p>
          <p className="mt-3">
            No Internet service or information-storage system can be guaranteed to be completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">13. Your Choices and Privacy Rights</h2>
          <p>
            Depending on where you live and applicable law, you may have rights concerning your personal information, which may include rights to:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Request access to personal information we maintain about you;</li>
            <li>Request correction of inaccurate information;</li>
            <li>Request deletion of personal information;</li>
            <li>Obtain certain information in a portable format;</li>
            <li>Object to or restrict certain processing;</li>
            <li>Withdraw consent where processing is based on consent; and</li>
            <li>Appeal or complain to an appropriate privacy or data-protection authority where applicable.</li>
          </ul>
          <p className="mt-3">
            You may make a privacy request by contacting us at <a href="mailto:privacy@continua.info" className="underline hover:text-accent transition-colors">privacy@continua.info</a>.
          </p>
          <p className="mt-3">
            We may need to verify your identity before completing certain requests. We will respond within the period required by applicable law.
          </p>
          <p className="mt-3">
            We will not discriminate against you for exercising privacy rights provided by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">14. Children&apos;s Privacy</h2>
          <p>
            Continua is intended for adults age 18 and older. We ask individuals under 18 not to create an account, take a Continua assessment, or provide personal information through the service.
          </p>
          <p className="mt-3">
            Continua does not currently use age-verification technology to determine or verify a user&apos;s age.
          </p>
          <p className="mt-3">
            We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will take reasonable steps to delete that information.
          </p>
          <p className="mt-3">
            If you are a parent or guardian and believe that a child under 13 has provided personal information to Continua, please contact us at <a href="mailto:privacy@continua.info" className="underline hover:text-accent transition-colors">privacy@continua.info</a>.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">15. International Users</h2>
          <p>
            Continua is operated from the United States, and information may be stored and processed in the United States.
          </p>
          <p className="mt-3">
            If you access Continua from another country, your information may be transferred to a jurisdiction whose data-protection laws differ from those where you live.
          </p>
          <p className="mt-3">
            Where applicable law requires particular safeguards for international transfers of personal information, we will use appropriate mechanisms required by that law.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">16. California Privacy and Online Tracking Disclosure</h2>
          <p>
            California residents may have additional privacy rights under applicable California law.
          </p>
          <p className="mt-3">
            Continua does not currently sell personal information or share personal information with third parties for cross-context behavioral advertising.
          </p>
          <p className="mt-3">
            Continua does not currently allow third parties to collect personally identifiable information through Continua for the purpose of tracking users across unrelated websites or online services.
          </p>
          <p className="mt-3">
            As described above, Continua uses its own browser identifier, cookies, and local storage to operate the service, including associating anonymous assessment results with the browser that created them.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">17. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy as Continua changes or as legal requirements change.
          </p>
          <p className="mt-3">
            When we make changes, we will revise the effective date at the top of this Policy. If changes materially affect how we collect, use, or disclose personal information, we will provide additional notice when required by applicable law.
          </p>
          <p className="mt-3">
            Where applicable law requires consent to a new use of information, we will obtain that consent rather than relying solely on continued use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">18. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, our privacy practices, or a request concerning your personal information, contact:</p>
          <p className="mt-3">
            Continua<br />
            Email: <a href="mailto:privacy@continua.info" className="underline hover:text-accent transition-colors">privacy@continua.info</a><br />
            Website: <a href="https://continua.info" className="underline hover:text-accent transition-colors">continua.info</a>
          </p>
        </section>
      </div>
    </main>
  )
}
